import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, reason, remedy } = body;

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    if (remedy !== 'refund' && remedy !== 'credit') {
      return NextResponse.json({ error: 'Invalid remedy type' }, { status: 400 });
    }

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, user_id, status, bundle_id, delivered_at')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.user_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this submission' }, { status: 403 });
    }

    if (submission.status !== 'completed') {
      return NextResponse.json(
        { error: 'Submission must be completed to request guarantee' },
        { status: 400 }
      );
    }

    if (!submission.bundle_id) {
      return NextResponse.json(
        { error: 'This submission is not linked to a bundle' },
        { status: 400 }
      );
    }

    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .select('guarantee_purchase_number')
      .eq('id', submission.bundle_id)
      .single();

    if (bundleError || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    if (bundle.guarantee_purchase_number === null) {
      return NextResponse.json(
        { error: 'This purchase is not eligible for the money-back guarantee' },
        { status: 400 }
      );
    }

    if (!submission.delivered_at) {
      return NextResponse.json(
        { error: 'Submission has not been delivered yet' },
        { status: 400 }
      );
    }

    const deliveredAt = new Date(submission.delivered_at);
    const now = new Date();
    const daysSinceDelivery = (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      return NextResponse.json(
        { error: 'Guarantee redemption window has expired (7 days from delivery)' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('guarantee_redeemed_at')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    if (userData.guarantee_redeemed_at !== null) {
      return NextResponse.json(
        { error: 'You have already redeemed your one-time money-back guarantee' },
        { status: 400 }
      );
    }

    const { data: existingRefund, error: refundCheckError } = await supabase
      .from('refund_requests')
      .select('id')
      .eq('submission_id', submissionId)
      .maybeSingle();

    if (refundCheckError) {
      throw refundCheckError;
    }

    if (existingRefund) {
      return NextResponse.json(
        { error: 'A refund request already exists for this submission' },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await serviceSupabase.rpc('redeem_guarantee', {
      p_submission_id: submissionId,
      p_user_id: user.id,
      p_reason: reason.trim(),
      p_remedy: remedy
    });

    if (error) {
      console.error('redeem_guarantee RPC error:', error);
      throw error;
    }

    const result = data[0];
    const refundRequest = {
      id: result.out_id,
      submission_id: result.out_submission_id,
      user_id: result.out_user_id,
      reason: result.out_reason,
      remedy: result.out_remedy,
      status: result.out_status,
      created_at: result.out_created_at
    };

    return NextResponse.json({
      success: true,
      refundRequest
    });

  } catch (error) {
    console.error('Guarantee redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to process guarantee request' },
      { status: 500 }
    );
  }
}

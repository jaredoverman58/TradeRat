'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'

type FAQItem = {
  question: string
  answer: string | ReactNode
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs: FAQItem[] = [
    {
      question: 'How long does it take to get a response?',
      answer: "The Rat works while your league sleeps — most active 10 PM to 5 AM Mountain Time. Standard experts are available throughout the day and evening. We know your trade window won't wait — we always aim to respond as quickly as possible, often within a few hours. Response times may vary — but your analysis is always guaranteed within 24 hours.",
    },
    {
      question: 'What if I disagree with the advice?',
      answer: "Our experts provide their professional analysis based on the information you provide, but fantasy football always involves judgment calls and different perspectives. If you disagree with the recommendation, you're welcome to make your own decision – think of our service as a second opinion to inform your choice, not a mandate. We don't offer refunds based on disagreement with analysis, as the value is in the expert's time and expertise, not in whether you agree with the conclusion.",
    },
    {
      question: 'Can I get a refund?',
      answer: "Yes, under specific circumstances. If your response is delivered late (beyond the guaranteed timeframe), you'll receive an automatic choice: full refund or service credit for a future analysis. We don't issue refunds if you simply disagree with the advice or change your mind after receiving analysis. For Rat Rate services where The Rat is unavailable and reassignment is needed, see 'What happens if the Rat is unavailable?' below.",
    },
    {
      question: 'What is the Rat Rate?',
      answer: "Rat Rate is our premium service tier that guarantees your analysis will be completed by The Rat, our most experienced expert. Rat Rate services receive priority handling with faster turnaround times and more comprehensive analysis compared to standard tier. If you purchase Rat Rate and The Rat becomes unavailable, you'll receive options for reassignment or refund (see 'What happens if the Rat is unavailable?' below).",
    },
    {
      question: 'How does the Trade Finder work?',
      answer: (
        <>
          <p style={{ marginBottom: '12px' }}>
            The Full League Trade Finder is our most comprehensive service:
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>What you provide:</strong> Upload screenshots of every team roster in your league (typically 8-12 teams), league settings, your team goals, and any players you won&apos;t trade.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>What our expert does:</strong> Analyzes all rosters to identify which teams have what you need and need what you have, then creates 1-3 specific trade recommendations with target teams and exact players.
          </p>
          <p>
            <strong>What you receive:</strong> Detailed trade suggestions, analysis of why each works for both sides, roster impact breakdown, alternative targets, and negotiation strategy. This typically takes 45-60 minutes of expert analysis time compared to 20-30 minutes for standard evaluations.
          </p>
        </>
      ),
    },
    {
      question: 'What file formats can I upload?',
      answer: "We accept the most common image and document formats: JPG, PNG, HEIC (iPhone photos), PDF, CSV, and Excel files. Screenshots from your phone or computer work great – you don't need to convert anything. If you have a format not listed here, contact us and we'll see if we can accommodate it.",
    },
    {
      question: 'How do bundles work?',
      answer: "Bundles give you multiple evaluations at a discounted price. When you purchase a bundle (like a 3-pack or 5-pack), the credits are added to your account and don't expire until the end of the fantasy season. You can use them one at a time whenever you need analysis – you don't have to use all credits at once. Each time you submit a request, one credit is deducted from your bundle. Standard bundles work with any available expert; Rat Rate bundles guarantee The Rat for each evaluation.",
    },
    {
      question: 'What happens if my expert is late?',
      answer: "If your response is delivered after the guaranteed timeframe (24 hours for Accept/Decline and Counter Offer, 48 hours for Trade Finder), you'll automatically receive a choice: either a full refund of what you paid, or a service credit equal to the value of your purchase that you can use for a future analysis. We take our turnaround commitments seriously and this happens very rarely.",
    },
    {
      question: 'What happens if the Rat is unavailable?',
      answer: (
        <>
          <p style={{ marginBottom: '12px' }}>
            If you purchase Rat Rate service and The Rat is unavailable to complete it within 12 hours of submission, we&apos;ll contact you with three options:
          </p>
          <ul style={{ marginLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Wait with bonus:</strong> Continue waiting for The Rat and receive a bonus service credit</li>
            <li style={{ marginBottom: '8px' }}><strong>Reassign with partial refund:</strong> Accept analysis from The Badger (a standard-tier expert) and receive a partial refund of the Rat Rate premium</li>
            <li style={{ marginBottom: '8px' }}><strong>Full refund:</strong> Cancel the request and receive a complete refund</li>
          </ul>
        </>
      ),
    },
    {
      question: 'What is FAB/FAAB?',
      answer: "FAB (Free Agent Budget) or FAAB (Free Agent Acquisition Budget) is a system many leagues use for adding players from the waiver wire. Instead of a waiver priority order, each team gets a budget (often $100 for the season) to bid on free agents. When you want to add a player, you submit a blind bid – the team with the highest bid wins that player and spends that amount from their budget. It adds strategy because you have to decide how much each player is worth and manage your budget across the entire season.",
    },
    {
      question: 'What is Superflex?',
      answer: "Superflex is a roster position where you can start any player, including a quarterback. Most standard leagues only let you start one QB, but in Superflex leagues, you can start two QBs if you want (one in the QB slot, one in the Superflex slot). This makes quarterbacks much more valuable since teams that start two QBs have a huge advantage. Superflex leagues completely change draft strategy and trade values compared to standard formats.",
    },
    {
      question: 'What is IDP?',
      answer: "IDP stands for Individual Defensive Player. Most fantasy leagues only use team defenses (D/ST), but IDP leagues let you draft and start individual defensive players like linebackers, defensive backs, and defensive linemen. These leagues add an entirely new dimension to fantasy football since you need to evaluate defensive players the same way you do offensive ones. IDP leagues can be shallow (1-2 defensive starters) or very deep (8+ defensive starters).",
    },
    {
      question: 'What is a dynasty league?',
      answer: "Dynasty leagues are keeper leagues where you keep your entire roster year after year, not just a few players. When the season ends, you keep everyone and there's only a rookie draft (not a full redraft). This makes young players and draft picks extremely valuable since you're building a team for multiple years, not just one season. Dynasty strategy is completely different from redraft – a rebuilding team might trade away stars for young prospects and future picks, while a contending team does the opposite.",
    },
    {
      question: 'What is a keeper league?',
      answer: "Keeper leagues let you keep a limited number of players from your roster each year (commonly 2-5 keepers). Before each season's draft, you choose which players to keep, and those players are removed from the draft pool. The rest of your roster is filled through a normal draft. Keeper leagues add long-term strategy since you need to consider not just this season's value but also which players you'll want to keep next year. Many keeper leagues have rules about draft round cost or inflation to prevent teams from keeping superstars indefinitely.",
    },
    {
      question: 'What is PPR?',
      answer: "PPR stands for Points Per Reception. In standard scoring, players only score points for yardage and touchdowns. In PPR leagues, players also get 1 point for each catch they make. This makes pass-catching running backs and high-volume receivers more valuable. There's also Half-PPR (0.5 points per catch), which is a middle ground between standard and full PPR. When getting trade advice, always tell us your league's scoring format since player values change significantly between standard and PPR.",
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '80px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1.125rem',
            color: '#6b6457',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Everything you need to know about The Trade Rat
          </p>
        </div>

        {/* FAQ Accordion */}
        <div style={{ marginBottom: '60px' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #2a261e',
                marginBottom: '16px',
                backgroundColor: openIndex === index ? '#1a1710' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleQuestion(index)}
                style={{
                  width: '100%',
                  padding: '24px 32px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: openIndex === index ? '#C9A84C' : '#F2EDE4',
                  margin: 0,
                  transition: 'color 0.2s',
                }}>
                  {faq.question}
                </h3>
                <span style={{
                  fontSize: '1.5rem',
                  color: '#C9A84C',
                  marginLeft: '16px',
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                }}>
                  +
                </span>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div style={{
                  padding: '0 32px 32px 32px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#F2EDE4',
                }}>
                  {typeof faq.answer === 'string' ? (
                    <p>{faq.answer}</p>
                  ) : (
                    faq.answer
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            marginBottom: '24px',
          }}>
            Still have questions?
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '16px 48px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0C0A07',
              backgroundColor: '#C9A84C',
              border: 'none',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
          >
            Get Started
          </Link>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            marginTop: '16px',
          }}>
            No credit card required to sign up
          </p>
        </div>

        {/* Back to Home */}
        <div style={{
          borderTop: '1px solid #2a261e',
          paddingTop: '32px',
          textAlign: 'center',
        }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#C9A84C',
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

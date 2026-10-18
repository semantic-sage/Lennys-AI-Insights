import { Catalog } from '../../src/catalog.js'
import type { Episode, TakeawaysFile } from '../../src/types.js'

export const EPISODES: Episode[] = [
  { id: 1, videoId: 'aaaaaaaaaaa', title: 'The art and science of pricing', guest: 'Madhavan Ramanujam', role: 'Senior Partner, Simon-Kucher', date: '2022-12-08', duration: '1:38:33', tags: ['pricing', 'monetization', 'strategy'], desc: 'Willingness-to-pay research and monetization strategy.', url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa', archiveDir: 'a' },
  { id: 2, videoId: 'bbbbbbbbbbb', title: 'Mastering onboarding', guest: 'Lauryn Isford', role: 'Head of Growth, Airtable', date: '2023-02-12', duration: '1:04:21', tags: ['onboarding', 'growth', 'retention'], desc: 'Tactics that turn sign-ups into retained users.', url: 'https://www.youtube.com/watch?v=bbbbbbbbbbb', archiveDir: 'b' },
  { id: 3, videoId: 'ccccccccccc', title: 'The ultimate guide to product-led sales', guest: 'Elena Verna', role: 'Growth Advisor', date: '2023-04-23', duration: '1:16:10', tags: ['growth', 'PLG', 'metrics'], desc: 'When to add sales to a product-led motion and how to price the enterprise tier.', url: 'https://www.youtube.com/watch?v=ccccccccccc', archiveDir: 'c' },
]

export const TAKEAWAYS: TakeawaysFile = {
  generated: '2026-01-01',
  model: 'test',
  source: 'transcripts',
  episodes: [
    { episodeId: 1, videoId: 'aaaaaaaaaaa', framework: 'Willingness to pay: ask customers what they would pay before you build.', quote: 'Price is the moment of truth.', bestFor: ['Founder', 'Product Manager'], resources: [{ title: 'Monetizing Innovation', type: 'book' }],
      takeaways: [
        { format: 'do-this', text: 'Run willingness-to-pay interviews before writing a line of code.' },
        { format: 'remember-this', text: 'Pricing is a product decision, not a finance decision.' },
        { format: 'real-example', text: 'Uber tested price sensitivity city by city.' },
        { format: 'ask-yourself', text: 'Would your best customer pay double?' },
        { format: 'avoid-this', text: 'Do not copy a competitor price list.' },
      ] },
    { episodeId: 2, videoId: 'bbbbbbbbbbb', framework: 'Activation metric: pick the one action that predicts retention.', quote: 'Onboarding never ends.', bestFor: ['Growth Lead'], resources: [],
      takeaways: [
        { format: 'do-this', text: 'Define one activation metric and test onboarding against it.' },
        { format: 'remember-this', text: 'Users judge your product in the first session.' },
        { format: 'real-example', text: 'Airtable cut onboarding steps in half and retention rose.' },
        { format: 'ask-yourself', text: 'What does a retained user do in week one?' },
        { format: 'avoid-this', text: 'Do not ask for a credit card before showing value.' },
      ] },
  ],
}

export function fixtureCatalog(): Catalog {
  return new Catalog(EPISODES, TAKEAWAYS)
}

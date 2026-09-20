import { z } from 'zod';
export const chatInputSchema = z.object({ messages: z.array(z.object({
  id: z.string().max(200), role: z.enum(['user', 'assistant']),
  parts: z.array(z.object({ type: z.literal('text'), text: z.string().max(2000) })).min(1).max(10),
})).min(1).max(100), character: z.literal('brixy').default('brixy') }).refine(v => v.messages.reduce((n,m)=>n+m.parts.reduce((a,p)=>a+p.text.length,0),0) <= 40000, 'Conversation too long');

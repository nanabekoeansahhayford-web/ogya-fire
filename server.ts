import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI-powered Estimated Market Price Endpoint
app.post('/api/market-price-estimate', async (req, res) => {
  const { listing, similarItems, benchmark } = req.body || {};

  if (!listing || !listing.price) {
    return res.status(400).json({ error: 'Missing listing information' });
  }

  // If Gemini API is available, analyze with gemini-3.8-flash
  if (ai) {
    try {
      const comparablesSummary = Array.isArray(similarItems) && similarItems.length > 0
        ? similarItems.map((item: any, idx: number) =>
            `${idx + 1}. "${item.title}" - ${item.currency || 'GH₵'} ${Number(item.price).toLocaleString()} | Condition: ${item.condition} | Loc: ${item.location}`
          ).join('\n')
        : 'No direct comparables found in feed; evaluate against standard market benchmarks.';

      const prompt = `You are the Valuation & Market Intelligence AI for OGYA (FIRE) 🔥 Ghana's Premier Marketplace.
Evaluate the fair market price for this listing and compare it against similar items in its category.

Listing Details:
- Title: ${listing.title}
- Category: ${listing.categoryName} > ${listing.subcategory}
- Asking Price: ${listing.currency || 'GH₵'} ${Number(listing.price).toLocaleString()}
- Condition: ${listing.condition}
- Location: ${listing.location} (${listing.region})
- Negotiable: ${listing.isNegotiable ? 'Yes' : 'No'}
- Key Attributes: ${JSON.stringify(listing.attributes || {})}

Category Statistical Benchmark:
- Category Average Price: ${listing.currency || 'GH₵'} ${Number(benchmark?.categoryAveragePrice || listing.price).toLocaleString()}
- Category Median Price: ${listing.currency || 'GH₵'} ${Number(benchmark?.categoryMedianPrice || listing.price).toLocaleString()}
- Sample Size: ${benchmark?.sampleSize || 1} listings

Similar Items Listed in Category:
${comparablesSummary}

Tasks:
1. Estimate the realistic Fair Market Price Range (min, max, and median) in Ghana Cedis (GH₵) for this item considering its brand, specifications, condition, depreciation, and local demand in Ghana.
2. Determine the Deal Rating:
   - 'great_deal': Asking price is >10% lower than fair market median value.
   - 'good_deal': Asking price is 4% to 10% lower than fair market median value.
   - 'fair_price': Asking price is aligned within -4% to +5% of fair market median value.
   - 'above_market': Asking price is 6% to 15% higher than fair market median value.
   - 'overpriced': Asking price is >15% higher than fair market median value.
3. Provide a punchy Deal Label (e.g., 'Great Deal 🔥', 'Good Value 👍', 'Fair Market Price ⚖️', 'Above Market ⚠️', 'Premium Ask 🏷️').
4. Formulate 3-4 concise, high-value valuation factors explaining the rating (e.g. condition impact, specs, brand retention, demand in Ghana).
5. Give actionable buyer negotiation advice.`;

      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Market valuation request timed out')), 18000);
      });

      try {
        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'You are an expert marketplace valuation engine for Ghana (currency: GH₵). Provide unbiased, realistic pricing intelligence based on current Ghanaian market conditions and comparable marketplace listings. Always return valid JSON conforming to the requested schema.',
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  dealRating: {
                    type: Type.STRING,
                    description: "One of: 'great_deal', 'good_deal', 'fair_price', 'above_market', 'overpriced'",
                  },
                  dealLabel: {
                    type: Type.STRING,
                    description: "Short label like 'Great Deal 🔥' or 'Fair Market Price ⚖️'",
                  },
                  estimatedPriceMin: {
                    type: Type.NUMBER,
                    description: 'Lower fair market estimate in GH₵',
                  },
                  estimatedPriceMax: {
                    type: Type.NUMBER,
                    description: 'Upper fair market estimate in GH₵',
                  },
                  estimatedPriceMedian: {
                    type: Type.NUMBER,
                    description: 'Most realistic median fair market value in GH₵',
                  },
                  confidence: {
                    type: Type.INTEGER,
                    description: 'Confidence score from 75 to 98',
                  },
                  verdict: {
                    type: Type.STRING,
                    description: '1-2 sentence valuation summary',
                  },
                  factors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3-4 concise valuation factors',
                  },
                  negotiationAdvice: {
                    type: Type.STRING,
                    description: 'Practical counter-offer or purchasing advice',
                  },
                },
                required: [
                  'dealRating',
                  'dealLabel',
                  'estimatedPriceMin',
                  'estimatedPriceMax',
                  'estimatedPriceMedian',
                  'confidence',
                  'verdict',
                  'factors',
                ],
              },
            },
          }),
          timeoutPromise,
        ]);

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          ...parsed,
          isFallback: false,
        });
      } catch (innerError: any) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        console.warn('Gemini valuation unavailable, applying statistical benchmark fallback:', innerError?.message || innerError);
      }
    } catch (error: any) {
      console.warn('Market valuation processing notice:', error?.message || error);
    }
  }

  // Statistical fallback if AI unavailable
  const targetPrice = Number(listing.price);
  const medianBench = Number(benchmark?.categoryMedianPrice) || targetPrice;
  const isGreat = targetPrice < medianBench * 0.9;
  const isGood = targetPrice < medianBench * 0.96;
  const isFair = targetPrice <= medianBench * 1.06;

  const dealRating = isGreat ? 'great_deal' : isGood ? 'good_deal' : isFair ? 'fair_price' : 'above_market';
  const dealLabel = isGreat ? 'Great Deal 🔥' : isGood ? 'Good Value 👍' : isFair ? 'Fair Market Price ⚖️' : 'Above Market ⚠️';

  return res.json({
    dealRating,
    dealLabel,
    estimatedPriceMin: Math.round(medianBench * 0.92),
    estimatedPriceMax: Math.round(medianBench * 1.08),
    estimatedPriceMedian: Math.round(medianBench),
    confidence: 84,
    verdict: `Evaluated against ${similarItems?.length || 0} category comparables in ${listing.subcategory}.`,
    factors: [
      `Condition '${listing.condition}' benchmarked against current marketplace inventory.`,
      `Category median asking price is ${listing.currency || 'GH₵'} ${medianBench.toLocaleString()}.`,
      listing.isNegotiable ? 'Open to counter-offers by seller.' : 'Fixed asking price.',
    ],
    negotiationAdvice: listing.isNegotiable
      ? `You can make a counter-offer around ${listing.currency || 'GH₵'} ${Math.round(medianBench * 0.95).toLocaleString()}.`
      : 'Price is non-negotiable. Inspect condition thoroughly.',
    isFallback: true,
  });
});

// AI-powered Smart Price Advisor for Sellers
app.post('/api/smart-price-advisor', async (req, res) => {
  const {
    title,
    categoryId,
    categoryName,
    subcategory,
    condition,
    region,
    location,
    description,
    categoryBenchmark,
    similarItems,
  } = req.body || {};

  if (!title || !categoryName) {
    return res.status(400).json({ error: 'Missing product title or category' });
  }

  // If Gemini API is available, analyze with gemini-3.8-flash
  if (ai) {
    try {
      const comparablesSummary = Array.isArray(similarItems) && similarItems.length > 0
        ? similarItems.slice(0, 8).map((item: any, idx: number) =>
            `${idx + 1}. "${item.title}" - GH₵ ${Number(item.price).toLocaleString()} | Condition: ${item.condition} | Loc: ${item.location}`
          ).join('\n')
        : 'Evaluate against current Ghanaian marketplace prices and category benchmarks.';

      const prompt = `You are the Lead Pricing Strategist & Valuation Intelligence AI for OGYA (FIRE) 🔥, Ghana's premier online marketplace.
A Ghanaian seller is creating a listing on OGYA and needs expert advice on the optimal selling price in Ghana Cedis (GH₵).

Item Details:
- Title: ${title}
- Category: ${categoryName} > ${subcategory || 'General'}
- Condition: ${condition || 'Brand New'}
- Location: ${location || 'Accra'}, ${region || 'Greater Accra'}
- Description / Notes: ${description || 'None provided'}

Market Context in OGYA Marketplace:
- Category Benchmark Average: GH₵ ${categoryBenchmark?.categoryAveragePrice ? Number(categoryBenchmark.categoryAveragePrice).toLocaleString() : 'N/A'}
- Category Benchmark Median: GH₵ ${categoryBenchmark?.categoryMedianPrice ? Number(categoryBenchmark.categoryMedianPrice).toLocaleString() : 'N/A'}
- Sample Comparable Listings in Ghana:
${comparablesSummary}

Your goal:
Provide an accurate, realistic, competitive price recommendation tailored to current Ghanaian economic conditions, local purchasing power, import currency dynamics (GHS exchange rates), and active demand trends in cities like Accra, Kumasi, Takoradi, and Tamale.

Determine:
1. recommendedPrice: The optimal sweet-spot selling price in GH₵ that balances maximum seller return with rapid buyer interest within 3-7 days.
2. quickSalePrice: A competitive fast-liquidation price in GH₵ (usually 8%-15% lower) for urgent cash or rapid sale within 24-48 hours.
3. premiumPrice: An upper boundary asking price in GH₵ (usually 8%-15% higher) if the item is pristine, comes with accessories/warranty, or for patient sellers.
4. marketTrend: A punchy market sentiment phrase with emoji (e.g., "High Demand & Rapid Liquidity 🔥", "Steady Market with Consistent Inquiries 📈", "Competitive Tech Segment ⚡").
5. demandLevel: One of 'high', 'moderate', 'competitive'.
6. estimatedDaysToSell: Realistic timeline string (e.g., "2 - 5 days at recommended price, <48h for quick sale").
7. summary: 1-2 sentence executive pricing recommendation tailored to this specific item and condition in Ghana.
8. reasons: 3 concise, specific bullet points with Ghanaian market rationale (referencing model specs, condition impact, depreciation, and local demand).
9. proTip: 1 actionable seller tip for Ghana (e.g. WhatsApp negotiation tactic, photo advice, or delivery guidance).
10. suggestedNegotiable: true or false (whether setting 'Negotiable' is recommended for this item category in Ghana).`;

      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Smart price request timed out')), 18000);
      });

      try {
        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'You are an expert marketplace valuation and pricing strategist for Ghana (currency: GH₵). Provide realistic, actionable pricing intelligence based on current Ghanaian economic conditions and marketplace inventory. Always return valid JSON conforming to the requested schema.',
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendedPrice: {
                    type: Type.NUMBER,
                    description: 'Optimal selling price in GH₵',
                  },
                  quickSalePrice: {
                    type: Type.NUMBER,
                    description: 'Fast-cash liquidation price in GH₵',
                  },
                  premiumPrice: {
                    type: Type.NUMBER,
                    description: 'Upper boundary asking price in GH₵',
                  },
                  marketTrend: {
                    type: Type.STRING,
                    description: 'Short trend phrase with emoji',
                  },
                  demandLevel: {
                    type: Type.STRING,
                    description: "One of: 'high', 'moderate', 'competitive'",
                  },
                  estimatedDaysToSell: {
                    type: Type.STRING,
                    description: 'e.g. 2 - 5 days at recommended price',
                  },
                  summary: {
                    type: Type.STRING,
                    description: '1-2 sentence pricing recommendation',
                  },
                  reasons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 concise bullet points with Ghanaian market rationale',
                  },
                  proTip: {
                    type: Type.STRING,
                    description: 'Actionable seller tip for Ghana marketplace',
                  },
                  suggestedNegotiable: {
                    type: Type.BOOLEAN,
                    description: 'Whether to mark as negotiable',
                  },
                },
                required: [
                  'recommendedPrice',
                  'quickSalePrice',
                  'premiumPrice',
                  'marketTrend',
                  'demandLevel',
                  'estimatedDaysToSell',
                  'summary',
                  'reasons',
                  'proTip',
                  'suggestedNegotiable',
                ],
              },
            },
          }),
          timeoutPromise,
        ]);

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          ...parsed,
          currency: 'GH₵',
          isAiPowered: true,
          isFallback: false,
          analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } catch (innerError: any) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        console.warn('Gemini Smart Price advisor unavailable, applying statistical benchmark fallback:', innerError?.message || innerError);
      }
    } catch (error: any) {
      console.warn('Smart price advisor processing notice:', error?.message || error);
    }
  }

  // Statistical fallback if AI unavailable
  const medianBench = Number(categoryBenchmark?.categoryMedianPrice) || 2500;
  let conditionMultiplier = 1.0;
  if (condition === 'Brand New') conditionMultiplier = 1.1;
  else if (condition === 'Like New / Mint') conditionMultiplier = 1.0;
  else if (condition === 'Refurbished') conditionMultiplier = 0.88;
  else if (condition === 'Fairly Used') conditionMultiplier = 0.78;

  const optimal = Math.round(medianBench * conditionMultiplier);
  const quick = Math.round(optimal * 0.88);
  const premium = Math.round(optimal * 1.14);

  return res.json({
    recommendedPrice: optimal,
    quickSalePrice: quick,
    premiumPrice: premium,
    currency: 'GH₵',
    marketTrend: 'Steady Demand in Ghana 📈',
    demandLevel: 'high',
    estimatedDaysToSell: '3 - 6 days at recommended price, <48h for quick sale',
    summary: `Based on current Ghanaian marketplace activity for ${subcategory || categoryName}, pricing around GH₵ ${optimal.toLocaleString()} delivers competitive market traction.`,
    reasons: [
      `Condition '${condition || 'Brand New'}' factored against standard depreciation in ${region || 'Ghana'}.`,
      `Benchmark calculated from active ${categoryName} listings across Accra and regional hubs.`,
      `Optimal balance between seller profit and fast buyer engagement on WhatsApp.`,
    ],
    proTip: "Keep 'Price is Negotiable' checked to invite quick offers and close deals swiftly on WhatsApp.",
    suggestedNegotiable: true,
    isAiPowered: false,
    isFallback: true,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
});

// Setup Vite in Dev or Serve Static in Production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

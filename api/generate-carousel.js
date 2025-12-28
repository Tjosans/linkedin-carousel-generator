// api/generate-carousel.js
// This is a serverless function that connects to Google Gemini API
// Deploy this to Vercel or Netlify Functions

/**
 * ENVIRONMENT VARIABLES NEEDED:
 * GEMINI_API_KEY - Your Google Gemini API key from https://aistudio.google.com/apikey
 * 
 * To get your API key:
 * 1. Visit https://aistudio.google.com/apikey
 * 2. Sign in with your Google account
 * 3. Click "Create API Key"
 * 4. Copy the key and add it to your environment variables
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Extract user input from the request body
    const { topic, numTips, tone, audience, brandInfo } = req.body;

    // Validate required fields
    if (!topic || !numTips) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide topic and numTips.' 
      });
    }

    // Validate numTips is within acceptable range
    if (numTips < 3 || numTips > 7) {
      return res.status(400).json({ 
        error: 'numTips must be between 3 and 7.' 
      });
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact support.' 
      });
    }

    // Build the prompt for Gemini
    // This is where we craft the instructions that tell the AI exactly what to generate
    const prompt = buildPrompt(topic, numTips, tone, audience, brandInfo);

    console.log('Sending request to Gemini API...');
    
    // Make the API call to Google Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,  // Controls creativity (0-1, higher = more creative)
            topK: 40,          // Limits vocabulary to top 40 most likely tokens
            topP: 0.95,        // Nucleus sampling parameter
            maxOutputTokens: 2048,  // Maximum length of response
          }
        })
      }
    );

    // Check if the API request was successful
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      return res.status(geminiResponse.status).json({ 
        error: 'Failed to generate content. Please try again.',
        details: errorData
      });
    }

    // Parse the response from Gemini
    const data = await geminiResponse.json();
    
    // Extract the generated text from Gemini's response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data);
      return res.status(500).json({ 
        error: 'Unexpected response from AI. Please try again.' 
      });
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Raw AI response:', generatedText);

    // Parse the structured JSON response from the AI
    const carouselData = parseAIResponse(generatedText);

    // Validate the parsed data has all required fields
    if (!validateCarouselData(carouselData, numTips)) {
      console.error('Invalid carousel data structure:', carouselData);
      return res.status(500).json({ 
        error: 'Generated content was invalid. Please try again.' 
      });
    }

    console.log('Successfully generated carousel data');

    // Return the generated carousel data to the frontend
    return res.status(200).json({
      success: true,
      data: carouselData
    });

  } catch (error) {
    console.error('Error in generate-carousel function:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.',
      message: error.message
    });
  }
}

/**
 * Build the prompt that instructs Gemini on what to generate
 * This is crucial - the quality of output depends heavily on prompt quality
 */
function buildPrompt(topic, numTips, tone = 'professional', audience = 'professionals', brandInfo = '') {
  const toneDescriptions = {
    professional: 'formal and authoritative',
    casual: 'friendly and conversational',
    inspirational: 'motivating and uplifting',
    educational: 'clear and informative'
  };

  const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;

  return `You are an expert LinkedIn content creator specializing in creating high-engagement carousel posts. Your task is to generate content for a LinkedIn carousel about: "${topic}"

AUDIENCE: ${audience}
TONE: ${toneDesc}
${brandInfo ? `BRAND CONTEXT: ${brandInfo}` : ''}

Generate exactly ${numTips} tips/points for this carousel. Each tip should be:
- Actionable and specific
- Valuable to the target audience
- Written in a ${toneDesc} tone
- Concise enough to fit on a slide (2-3 sentences for description)

Additionally:
- Suggest 2 brand colors that match the topic and mood (as hex codes)
- Create an engaging call-to-action for the final slide
- Make the content shareable and likely to drive engagement

IMPORTANT: Respond ONLY with valid JSON in exactly this structure (no markdown, no code blocks, just pure JSON):

{
  "tips": [
    {
      "title": "Punchy 3-5 word title",
      "content": "2-3 sentences explaining this tip in detail. Make it actionable and specific."
    }
  ],
  "colors": {
    "primary": "#0A66C2",
    "accent": "#FF6B35"
  },
  "callToAction": "Engaging CTA that encourages likes, shares, or follows"
}

Generate the JSON now:`;
}

/**
 * Parse the AI's response and extract the JSON data
 * The AI sometimes wraps JSON in markdown code blocks, so we need to clean it
 */
function parseAIResponse(text) {
  try {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();
    
    // Remove ```json and ``` markers
    cleanedText = cleanedText.replace(/```json\s*/g, '');
    cleanedText = cleanedText.replace(/```\s*/g, '');
    
    // Find the JSON object (starts with { and ends with })
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw text:', text);
    throw new Error('Could not parse AI response as JSON');
  }
}

/**
 * Validate that the carousel data has all required fields
 */
function validateCarouselData(data, expectedTips) {
  if (!data) return false;
  
  // Check tips array exists and has correct length
  if (!Array.isArray(data.tips) || data.tips.length !== expectedTips) {
    console.error(`Expected ${expectedTips} tips, got ${data.tips?.length || 0}`);
    return false;
  }

  // Check each tip has required fields
  for (const tip of data.tips) {
    if (!tip.title || !tip.content) {
      console.error('Tip missing title or content:', tip);
      return false;
    }
  }

  // Check colors exist and are valid hex codes
  if (!data.colors || !data.colors.primary || !data.colors.accent) {
    console.error('Missing color data:', data.colors);
    return false;
  }

  // Validate hex color format
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(data.colors.primary) || !hexRegex.test(data.colors.accent)) {
    console.error('Invalid hex color format:', data.colors);
    return false;
  }

  // Check call to action exists
  if (!data.callToAction || typeof data.callToAction !== 'string') {
    console.error('Missing or invalid call to action:', data.callToAction);
    return false;
  }

  return true;
}

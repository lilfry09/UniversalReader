// 测试 OpenAI-compatible API 连接

const API_KEY = process.env.QA_API_KEY;
const BASE_URL = (process.env.QA_BASE_URL || 'https://new.sharedchat.cc/v1').replace(/\/+$/g, '');
const MODEL = process.env.QA_MODEL || 'gpt-3.5-turbo';

async function testAPI() {
  if (!API_KEY) {
    console.error('Missing QA_API_KEY environment variable.');
    process.exitCode = 1;
    return;
  }

  console.log('Testing API connection...');
  console.log(`Endpoint: ${BASE_URL}/chat/completions`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: 'Hello, reply with just "Hi"' }
        ],
        max_tokens: 10
      })
    });

    clearTimeout(timeoutId);

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText.substring(0, 500));
      return;
    }

    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Request failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

testAPI();

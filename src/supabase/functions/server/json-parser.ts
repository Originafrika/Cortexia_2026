/**
 * JSON PARSER UTILITY
 * Robust JSON extraction from LLM responses with markdown
 */

export function parseJSONFromMarkdown(text: string): any {
  let cleanedText = text.trim();
  
  console.log('🔍 Raw text length:', cleanedText.length);
  console.log('🔍 First 200 chars:', cleanedText.substring(0, 200));
  
  // Step 1: Remove markdown code blocks aggressively
  if (cleanedText.includes('```')) {
    console.log('🧹 Detected ``` markers');
    
    // Method 1: Try regex
    const regexMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (regexMatch && regexMatch[1]) {
      cleanedText = regexMatch[1].trim();
      console.log('✅ Extracted via regex');
    } else {
      // Method 2: Split and take the middle part
      const parts = cleanedText.split('```');
      if (parts.length >= 3) {
        // Take the part between first and second ```
        cleanedText = parts[1].replace(/^json\s*/i, '').trim();
        console.log('✅ Extracted via split');
      } else if (parts.length === 2) {
        // Only closing ``` 
        cleanedText = parts[0].trim();
        console.log('✅ Removed trailing ```');
      }
    }
  }
  
  // Step 2: Find JSON object boundaries
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');
  
  console.log(`🔍 JSON boundaries: first={${firstBrace}, last=${lastBrace}}`);
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    console.error('❌ No valid JSON object boundaries found');
    console.error('Text:', cleanedText.substring(0, 500));
    throw new Error('No valid JSON object found in text');
  }
  
  // Step 3: Extract JSON string
  cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  
  console.log('📝 Extracted JSON preview:', cleanedText.substring(0, 200));
  
  // Step 3.5: Clean common LLM JSON formatting errors
  cleanedText = cleanJSONText(cleanedText);
  
  // Step 4: Parse JSON string to object
  try {
    const parsed = JSON.parse(cleanedText);
    console.log('✅ JSON parsed successfully');
    return parsed;
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    console.error('Failed to parse:', cleanedText.substring(0, 500));
    
    // Try to show context around the error position
    if (error.message.includes('position')) {
      const posMatch = error.message.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const start = Math.max(0, pos - 100);
        const end = Math.min(cleanedText.length, pos + 100);
        console.error('🔍 Error context:', cleanedText.substring(start, end));
        console.error('🔍 Position marker: ' + ' '.repeat(Math.min(100, pos - start)) + '^^^');
      }
    }
    
    throw new Error(`JSON parse failed: ${error.message}`);
  }
}

/**
 * Clean common LLM JSON formatting errors
 */
function cleanJSONText(jsonText: string): string {
  let cleaned = jsonText;
  
  // Fix 1: Fix quotes that close too early before conjunctions and continue text
  // Pattern: "text", more text that should be in quotes → "text, more text that should be in quotes"
  // This handles: "énergisante", parfaite pour → "énergisante, parfaite pour"
  cleaned = cleaned.replace(
    /(":\s*"[^"]+)",\s+([a-zàâäéèêëïîôùûüÿæœç][^"]*?)"/gi,
    '$1, $2"'
  );
  
  // Fix 2: Remove text in parentheses that's not inside quotes
  // Example: "theme": "Text" (Translation), → "theme": "Text (Translation)",
  cleaned = cleaned.replace(
    /"([^"]+)"\s*\(([^)]+)\)\s*,/g,
    '"$1 ($2)",'
  );
  
  // Fix 3: Remove trailing commas before closing brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  
  // Fix 4: Remove any standalone text after closing quote before comma/colon
  // "theme": "Text" (Translation) → "theme": "Text (Translation)"
  // This is safer than trying to fix nested quotes
  cleaned = cleaned.replace(
    /(":\s*"[^"]+)\s+([^",:{}\\[\\]]+)(\s*[,}])/g,
    '$1 $2"$3'
  );
  
  // Fix 5: Fix missing commas between properties (rare but happens)
  // "a": "b" "c": "d" → "a": "b", "c": "d"
  cleaned = cleaned.replace(
    /"\s*\n\s*"/g,
    '",\n  "'
  );
  
  console.log('🧹 JSON cleaned with 5 fix strategies');
  
  return cleaned;
}
# Gemini API Model Name Fix

## Issue
The backend server was using an incorrect Gemini API model name that caused 404 errors:
- **Old (broken):** `gemini-1.5-flash-latest`
- **Error:** "models/gemini-1.5-flash-latest is not found for API version v1"

## Root Cause
The Gemini API v1 endpoint does not support the `-latest` suffix for model names. The correct stable model name is `gemini-1.5-flash`.

## Fix Applied
Updated `/supabase/functions/server/index.tsx`:
- **Line 72-73:** Changed model from `gemini-1.5-flash-latest` to `gemini-1.5-flash`
- **Updated URL:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`

## Impact
This fix resolves:
- ✅ Source material analysis errors in Jamie Panel
- ✅ Brain dump outline generation errors
- ✅ All AI-powered Jamie features

## Testing
After this fix, the following should work correctly:
1. Opening a content item with source material → Jamie auto-analyzes source
2. Clicking "Brain Dump" → AI generates outline and thoughts
3. All other Jamie AI features that use the backend

## Status
✅ **FIXED** - Ready for testing

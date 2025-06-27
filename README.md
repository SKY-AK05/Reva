# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Future Implementation: Training Memory

The application is designed with a "Training Memory" feature in mind, allowing the AI to learn from user interactions. When the local rule-based logic fails and the app falls back to the Genkit API for a response, it's intended to save both the user's input and the AI's generated response.

This functionality is currently simulated. The function `saveToTrainingMemory` in `src/services/memory.ts` logs the interaction to the console.

To make this feature fully functional, you will need to:
1.  Set up a database, such as **Firebase Firestore**.
2.  Modify the `saveToTrainingMemory` function to write the data to your database instead of logging it to the console.
3.  (Optional) Build a "Rule Update Engine" to periodically analyze the stored data and suggest new rules for the local `simpleResponses` to make the assistant smarter and reduce API calls over time.

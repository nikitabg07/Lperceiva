"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export default function QuestionAnswer() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = "en-US";
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTranscribedText(transcript);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognitionInstance;
      } else {
        alert("Speech Recognition not supported in this browser.");
      }
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setTranscribedText("");
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendQuestion = async () => {
    if (!transcribedText.trim()) {
      alert("⚠ Please record a question first!");
      return;
    }

    try {
      const response = await fetch("https://voicea-back-ldg3.onrender.com/api/questions/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: "student@example.com", // replace with actual user email dynamically
          question: transcribedText,
        }),
      });

      if (response.ok) {
        alert("✅ Question submitted successfully!");
        setTranscribedText("");
      } else {
        alert("❌ Failed to submit question.");
      }
    } catch (error) {
      console.error("❌ Error submitting question:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-lg font-semibold">Ask a Question</h2>
      <p className="text-sm text-gray-600">
        🎙️ <strong>Recorded:</strong> {transcribedText || "Waiting for input..."}
      </p>

      <div className="flex gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`${isRecording ? "bg-red-600" : "bg-purple-600"} text-white`}
        >
          <Mic className="mr-2" size={16} />
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        <Button onClick={sendQuestion} className="bg-green-600 text-white">
          📩 Submit Question
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Download } from "lucide-react";
import html2pdf from "html2pdf.js";

export default function AssignmentWriting() {
  const [text, setText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Start speech recognition
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText((prevText) => prevText + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Download as PDF
  const downloadAsPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <h1 style="text-align:center;">Assignment</h1>
      <p style="font-size:14px; line-height:1.6;">${text.replace(/\n/g, "<br>")}</p>
    `;

    html2pdf()
      .set({ margin: 10, filename: "assignment.pdf", html2canvas: { scale: 2 } })
      .from(element)
      .save();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">Write & Submit Assignments</h2>

      <textarea
        className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Speak or type your assignment..."
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-4 justify-center">
        <Button
          className={`flex items-center gap-2 ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}
          onClick={isListening ? stopListening : startListening}
        >
          <Mic size={18} />
          {isListening ? "Stop Recording" : "Start Recording"}
        </Button>

        <Button
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          onClick={downloadAsPDF}
          disabled={!text.trim()}
        >
          <Download size={18} />
          Download as PDF
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Play, Pause, StopCircle, RefreshCcw } from "lucide-react";
import { pdfjs } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function BookReader() {
  const [text, setText] = useState<string>("");
  const [isReading, setIsReading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speechQueue, setSpeechQueue] = useState<SpeechSynthesisUtterance[]>([]);
  const [currentUtteranceIndex, setCurrentUtteranceIndex] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      await extractTextFromPDF(file);
    } else if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setText(e.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      alert("❌ Please upload a PDF or TXT file.");
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });

        const pdf = await loadingTask.promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          extractedText += pageText + " ";
        }

        setText(extractedText);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("PDF Extraction Error:", error);
      alert("Failed to extract text from PDF.");
    }
  };

  const splitTextIntoSentences = (text: string) => {
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g);
    return sentences || [text];
  };

  const startReading = () => {
    if (!text) {
      alert("No text to read.");
      return;
    }

    speechSynthesis.cancel();
    const sentences = splitTextIntoSentences(text);
    const utterances = sentences.map((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.onend = () => {
        if (index + 1 < sentences.length) {
          setCurrentUtteranceIndex(index + 1);
          speechSynthesis.speak(utterances[index + 1]);
        } else {
          setIsReading(false);
        }
      };
      return utterance;
    });

    setSpeechQueue(utterances);
    setIsReading(true);
    setPaused(false);
    setCurrentUtteranceIndex(0);
    speechSynthesis.speak(utterances[0]);
  };

  const pauseReading = () => {
    speechSynthesis.pause();
    setPaused(true);
  };

  const resumeReading = () => {
    if (paused && speechQueue.length > 0) {
      speechSynthesis.resume();
      setPaused(false);
    } else if (!isReading && speechQueue.length > 0) {
      // Resume from the current sentence
      speechSynthesis.speak(speechQueue[currentUtteranceIndex]);
      setIsReading(true);
    }
  };

  const stopReading = () => {
    speechSynthesis.cancel();
    setIsReading(false);
    setPaused(false);
    setSpeechQueue([]);
    setCurrentUtteranceIndex(0);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-700 text-center mb-5">📚 Accessible Book Reader</h2>

      <label
        htmlFor="bookUpload"
        className="cursor-pointer block w-full p-3 text-center text-sm font-medium bg-white border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
      >
        <Upload className="inline-block mr-2" size={18} />
        Upload PDF or TXT File
        <input
          id="bookUpload"
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {text && (
        <div className="p-4 bg-white rounded-lg shadow-inner overflow-y-auto max-h-60 mb-4 text-sm text-gray-800 whitespace-pre-line">
          {text.slice(0, 600)}{text.length > 600 && "..."}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={startReading} className="bg-green-600 hover:bg-green-700 text-white flex gap-2">
          <Play size={18} /> Play
        </Button>
        <Button onClick={pauseReading} disabled={!isReading} className="bg-yellow-500 hover:bg-yellow-600 text-white flex gap-2">
          <Pause size={18} /> Pause
        </Button>
        <Button onClick={resumeReading} disabled={!paused && !speechQueue.length} className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
          <RefreshCcw size={18} /> Resume
        </Button>
        <Button onClick={stopReading} className="bg-red-600 hover:bg-red-700 text-white flex gap-2">
          <StopCircle size={18} /> Stop
        </Button>
      </div>
    </div>
  );
}

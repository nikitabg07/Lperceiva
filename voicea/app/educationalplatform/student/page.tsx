"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Icons (Optional if using emoji, remove if unused)
import { Book, Play, Mic } from "lucide-react";

import ViewVideo from "./components/ViewVideo";
import QuestionAnswer from "./components/QuestionAnswer";
import VoiceNoteTaker from "./components/VoiceNoteTaker";
import StudentQuiz from "./components/StudentQuiz";
import AssignmentWriting from "./components/AssignmentWriting";

// Dynamically import BookReader for SSR safety
const BookReader = dynamic(
  () => import("@/app/educationalplatform/student/components/BookReader"),
  { ssr: false, loading: () => <p className="text-center">Loading Book Reader...</p> }
);

type ModalType = "video" | "qa" | "book" | "voice" | "quiz" | "assignment" | null;

interface User {
  email: string;
  userType: string;
}

export default function StudentDashboard() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Auth Check
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      try {
        const parsedUser: User = JSON.parse(loggedInUser);
        if (parsedUser.userType !== "student") {
          router.push("/login");
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing loggedInUser:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("loggedInUser");
    router.push("/login");
  }, [router]);

  const openModal = useCallback((type: ModalType) => setActiveModal(type), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  // Feature Cards
  const features = [
    { icon: "🎥", title: "Video Lecture", desc: "Learn through video", type: "video" },
    { icon: "🤖", title: "Doubts", desc: "Ask and answer questions", type: "qa" },
    { icon: "📖", title: "Read Books", desc: "Listen to books in audio", type: "book" },
    { icon: "🎤", title: "Voice Note Taker", desc: "Record and save your voice notes", type: "voice" },
    { icon: "📝", title: "Take Quiz", desc: "Test your knowledge with quizzes", type: "quiz" },
    { icon: "📄", title: "Assignment Writing", desc: "Write and submit assignments", type: "assignment" },
  ] as const;

  // Modal Content Mapping
  const modalContent = useMemo(() => {
    if (!user) return null;

    switch (activeModal) {
      case "video":
        return <ViewVideo userRole={user.userType} userEmail={user.email} />;
      case "qa":
        return <QuestionAnswer />;
      case "book":
        return <BookReader />;
      case "voice":
        return <VoiceNoteTaker />;
      case "quiz":
        return <StudentQuiz />;
      case "assignment":
        return <AssignmentWriting />;
      default:
        return null;
    }
  }, [activeModal, user]);

  const modalTitle: Record<ModalType, string> = {
    video: "Uploaded Videos",
    qa: "Question & Answer",
    book: "Book Reader",
    voice: "Voice Note Taker",
    quiz: "Take a Quiz",
    assignment: "Assignment Writing",
    null: "",
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-purple-600">
            Welcome, {user?.email || "Student"}
          </h2>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </Button>
        </div>

        <p className="text-center text-gray-600 mb-10">
          Manage your educational resources efficiently.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, type }, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-100 transform hover:scale-105 transition-all"
              onClick={() => openModal(type)}
              role="button"
              aria-label={`Open ${title}`}
            >
              <div className="text-5xl mb-3">{icon}</div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            key={`modal-${activeModal}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative"
            >
              <h3 className="text-2xl font-bold text-purple-600 mb-4 text-center">
                {modalTitle[activeModal]}
              </h3>

              {modalContent}

              <div className="flex justify-center mt-4">
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={closeModal}
                  aria-label="Close Modal"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

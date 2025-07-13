import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatModal } from "./ChatModal";

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Show prompt after a short delay
  useEffect(() => {
    const timeout = setTimeout(() => setShowPrompt(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    setIsOpen(true);
    setShowPrompt(false);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end space-y-2">
        {/* Prompt */}
        {showPrompt && !isOpen && (
          <div className="px-3 py-2 bg-white text-sm text-slate-700 shadow-lg rounded-md max-w-[200px] w-fit animate-fade-in">
            💬 Need help? Start to chat!
          </div>
        )}

        {/* Floating Chat Button */}
        <Button
          onClick={handleClick}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 animate-float"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </Button>
      </div>

      {/* Modal */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

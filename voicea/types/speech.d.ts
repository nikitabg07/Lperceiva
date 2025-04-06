interface Window {
    webkitSpeechRecognition: any;
  }
  
  declare var webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
  
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    start: () => void;
    stop: () => void;
  }
  
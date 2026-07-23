"use client";

import React, { useState, useEffect } from "react";
import { 
  Mic, MicOff, CheckSquare, Square, Calendar, 
  FileText, Search, Bot, Plus, ArrowRight, Image as ImageIcon,
  Folder, Trash2, Sparkles, Upload
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  imageUrl?: string;
  category?: string;
}

interface MeetingNote {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"daily" | "meetings">("daily");
  const [todayStr, setTodayStr] = useState<string>("");

  // Örnek Başlangıç Verileri
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<MeetingNote[]>([
    {
      id: "m1",
      title: "Haftalık Üretim Değerlendirmesi",
      category: "Genel Üretim",
      content: "Tapping plate kaynak sürelerinde 15 dakikalık gecikme tespit edildi. Kalite kontrol ekibiyle görüşülecek.",
      createdAt: "2026-07-23"
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Sayfa yüklendiğinde bugünün tarihini al ve Otomatik Devri (Rollover) çalıştır
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayStr(today);

    // Kayıtlı görevleri yükle veya örnekle başlat
    const savedTasks = localStorage.getItem("my_workspace_tasks");
    let initialTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [
      { id: "1", title: "Dünkü kontrol ve aksiyon takibi", date: "2026-07-22", completed: false },
      { id: "2", title: "Montaj ve kaynak süreleri raporu hazırlanacak", date: today, completed: false },
    ];

    // 🔄 OTOMATİK DEVİR (ROLLOVER): Tamamlanmayan eski işleri bugüne taşı
    const updatedTasks = initialTasks.map(t => {
      if (!t.completed && t.date < today) {
        return { ...t, date: today };
      }
      return t;
    });

    setTasks(updatedTasks);
  }, []);

  // Görevler değiştikçe hafızaya kaydet
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("my_workspace_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // 🎙️ SESLİ NOT (SPEECH TO TEXT)
  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "tr-TR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const addTranscriptToTask = () => {
    if (!transcript) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: transcript,
      date: todayStr,
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setTranscript("");
  };

  // Toplantı Cümlesini Göreve Dönüştürme
  const convertTextToTask = (selectedText: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: selectedText,
      date: todayStr,
      completed: false
    };
    setTasks([newTask, ...tasks]);
    alert(`"${selectedText}" cümlesi bugünün görevlerine eklendi!`);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Fotoğraf Ekleme
  const handleImageUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, imageUrl: reader.result as string } : t));
      };
      reader.readAsDataURL(file);
    }
  };

  // Gemini Yapay Zeka Analizi Simülasyonu
  const runGeminiAnalysis = (text: string) => {
    setAiAnalysis(`🤖 Gemini Analizi: "${text}" konusu için önerilen sonraki adım: İlgili bölüm sorumlusu ile süre doğrulama toplantısı planlanmalı.`);
  };

  // Arama Filtreleri
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* SOL MENÜ */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Kişisel Asistan</h1>
          </div>

          {/* ARAMA */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Geçmişte kelime ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("daily")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "daily" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Günlük Görevler
            </button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "meetings" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Toplantı Notları
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
          Senkronize & Güvenli Mod
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* SESLİ NOT MİKROFON ALANI */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-600" /> Konuşarak Görev / Not Ekle
            </span>
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full text-white transition-all ${
                isListening ? "bg-red-500 animate-pulse ring-4 ring-red-100" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          {transcript && (
            <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-700 flex flex-col gap-2">
              <p className="italic">"{transcript}"</p>
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={addTranscriptToTask}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700"
                >
                  Bugünün Görevlerine Ekle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* GEMINI BİLGİ / ANALİZ KUTUSU */}
        {aiAnalysis && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-sm text-indigo-900 flex justify-between items-start">
            <p>{aiAnalysis}</p>
            <button onClick={() => setAiAnalysis(null)} className="text-indigo-500 font-bold ml-2">✕</button>
          </div>
        )}

        {/* GÜNLÜK GÖREVLER */}
        {activeTab === "daily" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Bugünün Görevleri ({todayStr})
              </h2>
            </div>

            {/* Yeni Görev Ekleme */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Yeni bir görev veya not yaz..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTaskTitle) {
                    setTasks([{ id: Date.now().toString(), title: newTaskTitle, date: todayStr, completed: false }, ...tasks]);
                    setNewTaskTitle("");
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <button
                onClick={() => {
                  if (!newTaskTitle) return;
                  setTasks([{ id: Date.now().toString(), title: newTaskTitle, date: todayStr, completed: false }, ...tasks]);
                  setNewTaskTitle("");
                }}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Ekle
              </button>
            </div>

            {/* Görev Listesi */}
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Görev bulunamadı.</div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(task.id)} className="text-indigo-600">
                          {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-300" />}
                        </button>
                        <span className={`text-sm ${task.completed ? "line-through text-slate-400" : "text-slate-800 font-medium"}`}>
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Fotograf Ekle */}
                        <label className="cursor-pointer text-slate-400 hover:text-slate-600">
                          <ImageIcon className="w-4 h-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(task.id, e)} />
                        </label>
                        {/* Gemini Butonu */}
                        <button onClick={() => runGeminiAnalysis(task.title)} title="Gemini ile Fikir Al" className="text-indigo-500 hover:text-indigo-700">
                          <Bot className="w-4 h-4" />
                        </button>
                        {/* Sil */}
                        <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Fotoğraf Görünümü */}
                    {task.imageUrl && (
                      <div className="ml-8 mt-1">
                        <img src={task.imageUrl} alt="Görev Görseli" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TOPLANTI NOTLARI */}
        {activeTab === "meetings" && (
          <section className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Toplantı Notları
            </h2>

            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {meeting.category}
                      </span>
                      <h3 className="font-semibold text-base text-slate-900 mt-1">{meeting.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{meeting.createdAt}</span>
                  </div>

                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p>{meeting.content}</p>
                    <button
                      onClick={() => convertTextToTask("Toplantı Aksiyonu: Kalite kontrol ekibiyle görüşülecek.")}
                      className="mt-3 text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Bu aksiyonu Bugünün Görevlerine Aktar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

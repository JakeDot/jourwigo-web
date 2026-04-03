import React, { useState, useEffect, useRef } from 'react';
import { WherigoEngine } from '../lib/wherigo';
import JSZip from 'jszip';
import { 
  Play, 
  Edit, 
  Map as MapIcon, 
  Package, 
  User, 
  CheckSquare, 
  Clock, 
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Terminal,
  FileCode,
  FileArchive,
  Upload,
  Music,
  Video,
  File as FileIcon,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function WherigoApp() {
  const [mode, setMode] = useState<'editor' | 'player'>('editor');
  const [editorTab, setEditorTab] = useState<'code' | 'resources'>('code');
  const [resources, setResources] = useState<{ name: string, file: File }[]>([]);
  const [luaCode, setLuaCode] = useState<string>(`
-- JourWigo Web Cartridge
cart = Wherigo.ZCartridge({
  Name = "The Hidden Relic",
  Description = "A mysterious adventure in the digital realm."
})

-- Register some Java classes for easier access
RegisterJavaClass("com.jourwigo.System")
RegisterJavaClass("com.jourwigo.UI")

zone1 = Wherigo.ZZone(cart)
zone1.Name = "Ancient Portal"
zone1.Description = "A shimmering portal that leads to unknown places."

function zone1:OnEnter()
  com.jourwigo.UI.Toast("You have entered the Ancient Portal!")
  com.jourwigo.System.Log("User entered zone1")
  
  -- Direct JavaFunction call
  JavaFunction("com.jourwigo.Audio.PlaySound", "portal_hum.mp3")
end

function zone1:OnExit()
  com.jourwigo.UI.Toast("The portal's energy fades away.")
end

task1 = Wherigo.ZTask(cart)
task1.Name = "Activate the Portal"
task1.Description = "Find the power source to activate the portal."

com.jourwigo.System.Log("Cartridge initialized successfully!")
`);
  const [logs, setLogs] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [cartridgeState, setCartridgeState] = useState<any>(null);
  const engineRef = useRef<WherigoEngine | null>(null);

  useEffect(() => {
    const engine = new WherigoEngine();
    
    engine.registerJavaFunction('com.jourwigo.System.Log', (msg: string) => {
      setLogs(prev => [...prev, `[LUA LOG]: ${msg}`]);
    });
    
    engine.registerJavaFunction('com.jourwigo.UI.Toast', (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
      setLogs(prev => [...prev, `[UI TOAST]: ${msg}`]);
    });

    engine.registerJavaFunction('com.jourwigo.Audio.PlaySound', (file: string) => {
      setLogs(prev => [...prev, `[AUDIO]: Playing ${file}`]);
    });

    engine.init().then(() => {
      engineRef.current = engine;
    });
  }, []);

  const handlePlay = async () => {
    if (!engineRef.current) return;
    try {
      setLogs([]);
      await engineRef.current.loadCartridge(luaCode);
      updateState();
      setMode('player');
    } catch (err: any) {
      setLogs(prev => [...prev, `ERROR: ${err.message}`]);
    }
  };

  const updateState = () => {
    if (engineRef.current) {
      setCartridgeState(engineRef.current.getCartridgeState());
    }
  };

  const handleZoneEvent = async (zoneId: number, event: string) => {
    if (!engineRef.current) return;
    await engineRef.current.runEvent(zoneId, event);
    updateState();
    setLogs(prev => [...prev, `Event triggered: ${event} on zone ${zoneId}`]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newResources = Array.from(files).map((file: any) => ({
      name: file.name,
      file: file
    }));

    setResources(prev => [...prev, ...newResources]);
    setLogs(prev => [...prev, `Added ${newResources.length} resource(s)`]);
  };

  const removeResource = (index: number) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveCartridge = async () => {
    const zip = new JSZip();
    
    // Add the main Lua file
    zip.file("_cartridge.lua", luaCode);
    
    // Add all resources
    resources.forEach(res => {
      zip.file(res.name, res.file);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cartridgeState?.name || "cartridge"}.gwz`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setLogs(prev => [...prev, "Cartridge saved as .gwz file"]);
      setToast("Cartridge saved successfully!");
    } catch (err: any) {
      setLogs(prev => [...prev, `ERROR saving cartridge: ${err.message}`]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">JourWigo Web</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Wherigo Builder & Player</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-lg">
            <button 
              onClick={() => setMode('editor')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                mode === 'editor' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Edit className="w-4 h-4" />
              Editor
            </button>
            <button 
              onClick={handlePlay}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                mode === 'player' ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Play className="w-4 h-4" />
              Play
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-indigo-500/40 font-bold flex items-center gap-3 border border-indigo-400/30"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === 'editor' ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Editor Content */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setEditorTab('code')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      editorTab === 'code' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <FileCode className="w-4 h-4" />
                    Lua Code
                  </button>
                  <button 
                    onClick={() => setEditorTab('resources')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      editorTab === 'resources' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Package className="w-4 h-4" />
                    Resources
                  </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl min-h-[600px]">
                  {editorTab === 'code' ? (
                    <>
                      <div className="bg-zinc-800/50 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">_cartridge.lua</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleSaveCartridge}
                            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                          >
                            <Download className="w-4 h-4" />
                            Save .gwz
                          </button>
                        </div>
                      </div>
                      <textarea 
                        value={luaCode}
                        onChange={(e) => setLuaCode(e.target.value)}
                        className="w-full h-[550px] bg-transparent p-6 font-mono text-sm focus:outline-none resize-none text-indigo-100 leading-relaxed"
                        spellCheck={false}
                      />
                    </>
                  ) : (
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">Resource Manager</h3>
                          <p className="text-sm text-zinc-500">Manage audio, images, and other assets for your cartridge.</p>
                        </div>
                        <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Files
                          <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {resources.length === 0 ? (
                          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                            <Package className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">No resources added yet</p>
                            <p className="text-xs">Upload images, audio, or video files</p>
                          </div>
                        ) : (
                          resources.map((res, i) => (
                            <div key={i} className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                                  {res.file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-indigo-400" /> :
                                   res.file.type.startsWith('audio/') ? <Music className="w-5 h-5 text-emerald-400" /> :
                                   res.file.type.startsWith('video/') ? <Video className="w-5 h-5 text-rose-400" /> :
                                   <FileIcon className="w-5 h-5 text-zinc-400" />}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-zinc-200 truncate max-w-[150px]">{res.name}</p>
                                  <p className="text-[10px] text-zinc-500">{(res.file.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeResource(i)}
                                className="text-zinc-600 hover:text-red-400 transition-colors p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar / Logs */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Console Output
                  </h3>
                  <div className="bg-black/40 rounded-xl p-4 h-[300px] overflow-y-auto font-mono text-xs space-y-1 border border-zinc-800/50">
                    {logs.length === 0 ? (
                      <span className="text-zinc-600 italic">No output yet...</span>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className={cn(
                          "py-0.5 border-l-2 pl-2",
                          log.startsWith('ERROR') ? "text-red-400 border-red-500/50" : "text-indigo-300 border-indigo-500/50"
                        )}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6">
                  <h3 className="text-indigo-400 font-semibold mb-2">Pro Tip</h3>
                  <p className="text-sm text-indigo-200/70 leading-relaxed">
                    Use <code className="bg-indigo-500/20 px-1 rounded text-indigo-300">JavaFunction("class.constant", args)</code> to call native extensions.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="player"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Player UI */}
              <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                  <ImageIcon className="w-12 h-12 text-zinc-700" />
                  <div className="absolute bottom-6 left-6 z-20">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">{cartridgeState?.name || "My Adventure"}</h2>
                    <p className="text-zinc-300 text-sm drop-shadow-md">{cartridgeState?.description || "Starting your journey..."}</p>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <PlayerCard icon={MapIcon} label="Locations" count={cartridgeState?.zones?.length || 0} />
                    <PlayerCard icon={Package} label="Inventory" count={0} />
                    <PlayerCard icon={CheckSquare} label="Tasks" count={cartridgeState?.tasks?.length || 0} />
                    <PlayerCard icon={User} label="Characters" count={0} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Zone Status</h3>
                    <div className="space-y-3">
                      {cartridgeState?.zones?.map((zone: any) => (
                        <div key={zone.id} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              zone.state === 'inside' ? "bg-green-500 animate-pulse" : "bg-zinc-600"
                            )} />
                            <div>
                              <p className="text-sm font-semibold text-zinc-200">{zone.name}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{zone.state}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleZoneEvent(zone.id, 'OnEnter')}
                              className="text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded transition-colors"
                            >
                              Enter
                            </button>
                            <button 
                              onClick={() => handleZoneEvent(zone.id, 'OnExit')}
                              className="text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-1 rounded transition-colors"
                            >
                              Exit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulator Sidebar */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Simulator Console
                  </h3>
                  <div className="bg-black/40 rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-[10px] space-y-1 border border-zinc-800/50">
                    {logs.map((log, i) => (
                      <div key={i} className="text-zinc-400 py-0.5 border-l border-zinc-800 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setMode('editor')}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-bold transition-all border border-zinc-700/50"
                >
                  Return to Editor
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function PlayerCard({ icon: Icon, label, count }: { icon: any, label: string, count: number }) {
  return (
    <button className="bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800 p-4 rounded-2xl transition-all group text-left">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
        <span className="text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <p className="text-sm font-semibold text-zinc-300">{label}</p>
    </button>
  );
}

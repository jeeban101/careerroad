import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Target, Clock, Trophy, Star, BookOpen, Youtube, FileText, ExternalLink, Award, Zap, TrendingUp } from "lucide-react";
import { SkillRoadmapContent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { Badge } from "@/components/ui/badge";

interface InteractiveSkillRoadmapProps {
  skillRoadmap: any;
}

interface TaskProgress {
  stageIndex: number;
  taskIndex: number;
  completed: boolean;
}

interface StageNote {
  stageIndex: number;
  note: string;
}

const stageColors = [
  { gradient: "from-purple-600 to-purple-800", border: "border-purple-500/40", bg: "bg-purple-900/40" },
  { gradient: "from-blue-600 to-blue-800", border: "border-blue-500/40", bg: "bg-blue-900/40" },
  { gradient: "from-emerald-600 to-emerald-800", border: "border-emerald-500/40", bg: "bg-emerald-900/40" },
  { gradient: "from-amber-600 to-amber-800", border: "border-amber-500/40", bg: "bg-amber-900/40" },
  { gradient: "from-pink-600 to-pink-800", border: "border-pink-500/40", bg: "bg-pink-900/40" },
];

const getResourceIcon = (resource: string) => {
  if (resource.toLowerCase().includes('youtube') || resource.toLowerCase().includes('video')) {
    return <Youtube className="text-red-400" size={20} />;
  }
  if (resource.toLowerCase().includes('docs') || resource.toLowerCase().includes('documentation')) {
    return <FileText className="text-blue-400" size={20} />;
  }
  if (resource.toLowerCase().includes('book') || resource.toLowerCase().includes('read')) {
    return <BookOpen className="text-green-400" size={20} />;
  }
  return <ExternalLink className="text-purple-400" size={20} />;
};

export default function InteractiveSkillRoadmap({ skillRoadmap }: InteractiveSkillRoadmapProps) {
  const { toast } = useToast();
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);
  const [stageNotes, setStageNotes] = useState<StageNote[]>([]);
  const [expandedStage, setExpandedStage] = useState<number | null>(0);
  const [xp, setXp] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");

  if (!skillRoadmap || !skillRoadmap.skillContent) {
    return null;
  }

  const content: SkillRoadmapContent = skillRoadmap.skillContent;
  
  // Calculate total tasks
  const totalTasks = content.stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
  const completedTasks = taskProgress.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleTaskToggle = (stageIndex: number, taskIndex: number) => {
    const existingProgress = taskProgress.find(
      p => p.stageIndex === stageIndex && p.taskIndex === taskIndex
    );

    if (existingProgress) {
      setTaskProgress(prev => 
        prev.map(p => 
          p.stageIndex === stageIndex && p.taskIndex === taskIndex 
            ? { ...p, completed: !p.completed }
            : p
        )
      );
      
      if (!existingProgress.completed) {
        // Task completed
        setXp(prev => prev + 10);
        
        // Check if stage is now complete
        const stageTaskCount = content.stages[stageIndex].tasks.length;
        const stageCompletedCount = taskProgress.filter(
          p => p.stageIndex === stageIndex && p.completed
        ).length + 1;
        
        if (stageCompletedCount === stageTaskCount) {
          setXp(prev => prev + 50);
          triggerCelebration();
          showMotivationalMessage(`🎉 Amazing! You've completed ${content.stages[stageIndex].stage}!`);
        } else {
          showMotivationalMessage(`+10 XP! ${stageTaskCount - stageCompletedCount} tasks left in this stage! 🔥`);
        }
      }
    } else {
      setTaskProgress(prev => [...prev, { stageIndex, taskIndex, completed: true }]);
      setXp(prev => prev + 10);
      
      const stageTaskCount = content.stages[stageIndex].tasks.length;
      if (stageTaskCount === 1) {
        setXp(prev => prev + 50);
        triggerCelebration();
        showMotivationalMessage(`🎉 Amazing! You've completed ${content.stages[stageIndex].stage}!`);
      } else {
        showMotivationalMessage(`+10 XP! Keep going! 🚀`);
      }
    }
  };

  const isTaskCompleted = (stageIndex: number, taskIndex: number) => {
    return taskProgress.some(
      p => p.stageIndex === stageIndex && p.taskIndex === taskIndex && p.completed
    );
  };

  const getStageProgress = (stageIndex: number) => {
    const stageTasks = content.stages[stageIndex].tasks.length;
    const completed = taskProgress.filter(
      p => p.stageIndex === stageIndex && p.completed
    ).length;
    return { total: stageTasks, completed, percentage: Math.round((completed / stageTasks) * 100) };
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const showMotivationalMessage = (message: string) => {
    setMotivationalMessage(message);
    toast({
      title: message,
      duration: 3000,
    });
    setTimeout(() => setMotivationalMessage(""), 3000);
  };

  const updateStageNote = (stageIndex: number, note: string) => {
    setStageNotes(prev => {
      const existing = prev.find(n => n.stageIndex === stageIndex);
      if (existing) {
        return prev.map(n => n.stageIndex === stageIndex ? { ...n, note } : n);
      }
      return [...prev, { stageIndex, note }];
    });
    toast({
      title: "Note saved!",
      description: "Your reflection has been saved.",
    });
  };

  const getStageNote = (stageIndex: number) => {
    return stageNotes.find(n => n.stageIndex === stageIndex)?.note || "";
  };

  useEffect(() => {
    if (completionPercentage === 100 && totalTasks > 0 && completedTasks === totalTasks) {
      triggerCelebration();
      showMotivationalMessage(`🎓 Congratulations! You've mastered ${content.skill}! 🎉`);
    } else if (completionPercentage >= 60 && completionPercentage < 100) {
      const msg = completionPercentage >= 80 ? "🔥 You're on fire! Almost there!" : "💪 Great progress! Keep it up!";
      if (!motivationalMessage) {
        setTimeout(() => showMotivationalMessage(msg), 500);
      }
    }
  }, [completionPercentage]);

  return (
    <section id="skill-roadmap-display" className="w-full max-w-6xl mx-auto mt-8 pb-12">
      {/* XP and Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-purple-500/20 pb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {skillRoadmap.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Target size={16} className="text-purple-400" />
                <span className="font-medium">{content.skill}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} className="text-pink-400" />
                <span className="font-medium">{content.timeFrame}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-2xl">
                <Zap className="animate-pulse" />
                {xp} XP
              </div>
              <p className="text-xs text-gray-400">Level {Math.floor(xp / 100) + 1}</p>
            </div>
            {completionPercentage === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full p-3"
              >
                <Trophy className="text-white" size={24} />
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Overall Progress</span>
            <span className="font-bold text-purple-400">{completedTasks}/{totalTasks} tasks • {completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3 bg-white/10" />
        </div>

        {motivationalMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-lg font-semibold text-yellow-300 animate-pulse"
          >
            {motivationalMessage}
          </motion.div>
        )}
      </motion.div>

      {/* Overview Card */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="mb-8 border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-glass">
          <CardHeader>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <BookOpen className="text-purple-400" />
              Overview
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 leading-relaxed">{content.overview}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Stages - Interactive Timeline */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-purple-400" />
          Your Learning Journey
        </h3>

        {content.stages.map((stage, stageIndex) => {
          const stageColor = stageColors[stageIndex % stageColors.length];
          const progress = getStageProgress(stageIndex);
          const isExpanded = expandedStage === stageIndex;
          const isCompleted = progress.completed === progress.total;

          return (
            <motion.div
              key={stageIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: stageIndex * 0.1 }}
            >
              <Card 
                className={`border-2 ${stageColor.border} shadow-lg backdrop-blur-glass hover:shadow-2xl transition-all duration-300 ${isCompleted ? 'ring-2 ring-green-500/50' : ''}`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedStage(isExpanded ? null : stageIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={`w-12 h-12 bg-gradient-to-br ${stageColor.gradient} rounded-full flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="text-white" size={24} />
                        ) : (
                          <span className="text-white font-bold text-lg">{stageIndex + 1}</span>
                        )}
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          {stage.stage}
                          {isCompleted && <Award className="text-yellow-400" size={20} />}
                        </h4>
                        <p className="text-sm text-gray-400">Duration: {stage.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-300">
                        {progress.completed}/{progress.total} tasks
                      </div>
                      <Progress value={progress.percentage} className="w-32 h-2 mt-1" />
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-6 pt-4">
                        {/* Tasks */}
                        <div>
                          <h5 className="text-sm font-semibold text-purple-300 mb-4 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Tasks to Complete ({progress.completed}/{progress.total})
                          </h5>
                          <div className="space-y-3">
                            {stage.tasks.map((task, taskIndex) => {
                              const completed = isTaskCompleted(stageIndex, taskIndex);
                              return (
                                <motion.div
                                  key={taskIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: taskIndex * 0.05 }}
                                  className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                                    completed 
                                      ? 'bg-green-500/20 border-2 border-green-500/40' 
                                      : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                                  }`}
                                  onClick={() => handleTaskToggle(stageIndex, taskIndex)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  data-testid={`task-${stageIndex}-${taskIndex}`}
                                >
                                  <div className="mt-0.5">
                                    {completed ? (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                                      >
                                        <CheckCircle className="text-white" size={16} />
                                      </motion.div>
                                    ) : (
                                      <div className="w-6 h-6 border-2 border-purple-400 rounded-full" />
                                    )}
                                  </div>
                                  <span className={`flex-1 leading-relaxed ${completed ? 'text-gray-300 line-through' : 'text-gray-100'}`}>
                                    {task}
                                  </span>
                                  {completed && (
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                                      +10 XP
                                    </Badge>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Resources */}
                        <div>
                          <h5 className="text-sm font-semibold text-pink-300 mb-4 flex items-center gap-2">
                            <BookOpen size={16} />
                            Resources ({stage.resources.length})
                          </h5>
                          <div className="grid md:grid-cols-2 gap-3">
                            {stage.resources.map((resource, resourceIdx) => (
                              <motion.div
                                key={resourceIdx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: resourceIdx * 0.05 }}
                                className="p-4 bg-gradient-to-br from-white/5 to-white/10 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition-all group"
                                whileHover={{ y: -2 }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    {getResourceIcon(resource)}
                                  </div>
                                  <p className="text-sm text-gray-200 leading-relaxed flex-1 group-hover:text-white transition-colors">
                                    {resource}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className={`p-4 rounded-lg ${stageColor.bg} border ${stageColor.border}`}>
                          <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <FileText size={16} />
                            Your Notes & Reflections
                          </h5>
                          <Textarea
                            placeholder="Add your notes, questions, or reflections for this stage..."
                            value={getStageNote(stageIndex)}
                            onChange={(e) => updateStageNote(stageIndex, e.target.value)}
                            className="bg-white/5 border-white/10 text-white min-h-[100px] resize-none"
                            data-testid={`notes-${stageIndex}`}
                          />
                          <p className="text-xs text-gray-400 mt-2">Your notes are saved automatically</p>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="mt-8 border-2 border-green-500/30 shadow-xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-glass">
          <CardHeader>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="text-green-400" />
              Milestones
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <Star size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200 leading-relaxed font-medium">{milestone}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expected Outcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="mt-8 border-2 border-blue-500/30 shadow-xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-glass">
          <CardHeader>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="text-blue-400" />
              Expected Outcome
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 leading-relaxed text-lg">
              {content.expectedOutcome}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion Celebration */}
      {completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 text-center"
        >
          <Card className="border-4 border-yellow-500/50 shadow-2xl bg-gradient-to-br from-yellow-900/60 to-amber-900/60 backdrop-blur-glass">
            <CardContent className="p-12">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent mb-4">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-2xl text-white mb-6">
                You've mastered {content.skill}!
              </p>
              <p className="text-gray-300 mb-8">
                Total XP Earned: <span className="text-yellow-400 font-bold text-2xl">{xp}</span>
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Share Your Achievement 🚀
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </section>
  );
}

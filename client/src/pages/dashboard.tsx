import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, BookOpen, Zap, TrendingUp, Clock, Calendar, ArrowRight, Play, Sparkles, Brain, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AchievementsShowcase } from "@/components/achievements-showcase";
import { WeeklyXPChart } from "@/components/weekly-xp-chart";
import type { UserRoadmapHistory } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { ResumeAnalyzer } from "@/components/resume-analyzer";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<"all" | "career" | "skill" | "kanban">("all");

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  // Fetch recent roadmaps
  const { data: recentRoadmaps = [] } = useQuery<UserRoadmapHistory[]>({
    queryKey: ['/api/user-roadmap-history'],
    enabled: !!user,
  });

  if (!user) {
    navigate('/');
    return null;
  }

  const totalXp = (stats as any)?.totalXp || 0;
  const currentStreak = (stats as any)?.currentStreak || 0;
  const longestStreak = (stats as any)?.longestStreak || 0;
  const level = Math.floor(totalXp / 100) + 1;
  const xpToNextLevel = 100 - (totalXp % 100);
  const levelProgress = (totalXp % 100);

  const totalRoadmaps = recentRoadmaps.length || 0;
  const completedTasks = (stats as any)?.completedTasks || 0;

  // Mock data for new features
  const weeklyXP = [
    { day: "Mon", xp: 20 },
    { day: "Tue", xp: 50 },
    { day: "Wed", xp: 10 },
    { day: "Thu", xp: 0 },
    { day: "Fri", xp: 30 },
    { day: "Sat", xp: 40 },
    { day: "Sun", xp: totalXp % 10 },
  ];

  const activityData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 10)
  }));

  const achievements = [
    { id: "1", name: "Beginner Learner", description: "Create your first roadmap", icon: "star", unlocked: totalRoadmaps > 0 },
    { id: "2", name: "3-Day Streak", description: "Maintain a 3-day learning streak", icon: "flame", unlocked: currentStreak >= 3, progress: currentStreak, requirement: 3 },
    { id: "3", name: "Task Master", description: "Complete 10 tasks", icon: "trophy", unlocked: completedTasks >= 10, progress: completedTasks, requirement: 10 },
    { id: "4", name: "Skill Explorer", description: "Complete a skill roadmap", icon: "target", unlocked: false, progress: 0, requirement: 1 },
    { id: "5", name: "Consistency King", description: "Reach a 7-day streak", icon: "flame", unlocked: currentStreak >= 7, progress: currentStreak, requirement: 7 },
    { id: "6", name: "XP Champion", description: "Earn 500 XP", icon: "zap", unlocked: totalXp >= 500, progress: totalXp, requirement: 500 },
  ];

  const dailyGoal = {
    mission: currentStreak > 0 ? `Complete 2 tasks to maintain your ${currentStreak}-day streak!` : "Complete 2 tasks to start your streak!",
    progress: 0,
    target: 2
  };

  const continueRoadmap = recentRoadmaps[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const filteredRoadmaps = recentRoadmaps.filter(r => {
    if (filter === "all") return true;
    if (filter === "career") return r.roadmapType === "career";
    if (filter === "skill") return r.roadmapType === "skill";
    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.firstName || 'Explorer'}! 👋
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Here's your progress and recent activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* XP & Level Card with Animation */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }}>
            <Card className="bg-card bg-gradient-to-br from-pink-500/25 to-pink-600/25 border-pink-400/30 transition-all duration-300 backdrop-blur-glass hover:shadow-2xl hover:shadow-pink-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Zap className="text-yellow-600 dark:text-yellow-300" size={18} />
                  Level & XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-5xl font-bold text-foreground mb-2"
                >
                  Level {level}
                </motion.div>
                <div className="text-sm text-foreground/80 mb-3">
                  {totalXp} XP • {xpToNextLevel} XP to next level
                </div>
                <Progress value={levelProgress} className="h-2 bg-slate-200" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }}>
            <Card className="bg-card bg-gradient-to-br from-orange-400/25 to-orange-500/25 border-orange-300/30 transition-all duration-300 backdrop-blur-glass hover:shadow-2xl hover:shadow-orange-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Flame className="text-orange-600 dark:text-orange-300" size={18} />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-foreground mb-2">
                  {currentStreak} days
                </div>
                <div className="text-sm text-foreground/80">
                  Longest: {longestStreak} days 🔥
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Roadmaps Card */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }}>
            <Card className="bg-card bg-gradient-to-br from-blue-400/25 to-blue-500/25 border-blue-300/30 transition-all duration-300 backdrop-blur-glass hover:shadow-2xl hover:shadow-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Target className="text-blue-600 dark:text-blue-300" size={18} />
                  Total Roadmaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-foreground mb-2">
                  {totalRoadmaps}
                </div>
                <div className="text-sm text-foreground/80">
                  Active learning paths
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Completed Card */}
          <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }}>
            <Card className="bg-card bg-gradient-to-br from-emerald-400/25 to-emerald-500/25 border-emerald-300/30 transition-all duration-300 backdrop-blur-glass hover:shadow-2xl hover:shadow-emerald-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Trophy className="text-emerald-600 dark:text-emerald-300" size={18} />
                  Tasks Done
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-foreground mb-2">
                  {completedTasks}
                </div>
                <div className="text-sm text-foreground/80">
                  Keep up the momentum!
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Daily Goal Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Target className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Today's Goal</div>
                    <div className="text-foreground font-semibold">{dailyGoal.mission}</div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="button-start-daily-goal"
                >
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Where You Left Off */}
        {continueRoadmap && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/30 backdrop-blur-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Play className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">Continue Where You Left Off</div>
                      <div className="text-foreground font-semibold">
                        {continueRoadmap.roadmapType === 'skill' 
                          ? `Learn ${continueRoadmap.skill} in ${continueRoadmap.timeFrame}`
                          : continueRoadmap.title
                        }
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/history')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    data-testid="button-continue-roadmap"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Activity & Achievements Row */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Activity Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card border border-border backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="text-purple-400" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap data={activityData} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Time Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="bg-card border border-border backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Timer className="text-purple-400" />
                  Time Spent Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground mb-2">
                  {Math.floor((stats as any)?.weeklyTimeSpent / 60) || 0}h {((stats as any)?.weeklyTimeSpent % 60) || 0}m
                </div>
                <div className="text-sm text-muted-foreground">This week</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-card border border-border backdrop-blur-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Trophy className="text-yellow-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementsShowcase achievements={achievements} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <Card className="bg-card border border-border backdrop-blur-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="text-green-400" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyXPChart data={weeklyXP} />
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30 backdrop-blur-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Brain className="text-indigo-400" />
                AI Suggests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground mb-2">
                    Try the "Deploy a sample Node.js app on Kubernetes" project next
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on your learning in DevOps and containerization
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-indigo-400 text-indigo-400 hover:bg-indigo-400 hover:text-white"
                  data-testid="button-generate-ai-project"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resume Analyzer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.92 }}
        >
          <ResumeAnalyzer />
        </motion.div>

        {/* Recent Roadmaps with Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
        >
          <Card className="bg-card border border-border backdrop-blur-glass">
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="text-purple-400" />
                  Recent Roadmaps
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex gap-1 sm:gap-2">
                    {["all", "career", "skill", "kanban"].map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? "default" : "outline"}
                        onClick={() => setFilter(f as any)}
                        className={filter === f ? "bg-purple-600 hover:bg-purple-700" : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80"}
                        data-testid={`filter-${f}`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <Button
                    aria-label="View all roadmaps"
                    variant="ghost"
                    size="sm"
                    className="text-purple-500 hover:text-purple-500 px-2 py-1"
                    onClick={() => navigate('/history')}
                    data-testid="button-view-all-roadmaps"
                  >
                    <span className="hidden sm:inline">View All</span>
                    <ArrowRight className="h-4 w-4 ml-0 sm:ml-2" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {filteredRoadmaps.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No roadmaps yet! Start your learning journey.</p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="button-create-first-roadmap"
                  >
                    Create Your First Roadmap
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredRoadmaps.slice(0, 5).map((roadmap) => {
                    const isSkillRoadmap = roadmap.roadmapType === 'skill';
                    const title = isSkillRoadmap 
                      ? `Learn ${roadmap.skill} in ${roadmap.timeFrame}`
                      : roadmap.title;
                    
                    return (
                      <motion.div
                        key={roadmap.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-secondary rounded-lg border border-border hover:border-purple-500/50 transition-all"
                        data-testid={`roadmap-card-${roadmap.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300
    dark:bg-purple-600/20 dark:text-purple-300 dark:border-purple-500/30">
                              {isSkillRoadmap ? 'Skill' : 'Career'}
                            </Badge>
                            <h3 className="text-foreground font-semibold">{title}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {roadmap.createdAt && format(new Date(roadmap.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Last viewed: {roadmap.lastAccessed && format(new Date(roadmap.lastAccessed), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/history')}
                          className="w-full sm:w-auto mt-2 sm:mt-0 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all"
                          data-testid={`button-resume-${roadmap.id}`}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

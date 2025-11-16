import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, BookOpen, Zap, TrendingUp, Clock, Calendar, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import Header from "@/components/header";
import type { UserRoadmapHistory } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

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

  const totalXp = stats?.totalXp || 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const level = Math.floor(totalXp / 100) + 1;
  const xpToNextLevel = 100 - (totalXp % 100);
  const levelProgress = (totalXp % 100);

  const totalRoadmaps = recentRoadmaps.length || 0;
  const completedTasks = stats?.completedTasks || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container max-w-7xl mx-auto p-6">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.firstName || 'Explorer'}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Here's your progress and recent activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* XP & Level Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-pink-500/80 to-pink-600/80 border-pink-400/20 hover:border-pink-300/40 transition-all duration-300 backdrop-blur-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm font-medium">
                  <Zap className="text-yellow-300" size={18} />
                  Level & XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-white mb-2">
                  Level {level}
                </div>
                <div className="text-sm text-white/90 mb-3">
                  {totalXp} XP • {xpToNextLevel} XP to next level
                </div>
                <Progress value={levelProgress} className="h-2 bg-white/20" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-orange-400/80 to-orange-500/80 border-orange-300/20 hover:border-orange-200/40 transition-all duration-300 backdrop-blur-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm font-medium">
                  <Flame className="text-orange-100" size={18} />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-white mb-2">
                  {currentStreak} days
                </div>
                <div className="text-sm text-white/90">
                  Longest: {longestStreak} days 🔥
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Roadmaps Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-blue-400/80 to-blue-500/80 border-blue-300/20 hover:border-blue-200/40 transition-all duration-300 backdrop-blur-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm font-medium">
                  <Target className="text-blue-100" size={18} />
                  Total Roadmaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-white mb-2">
                  {totalRoadmaps}
                </div>
                <div className="text-sm text-white/90">
                  Active learning paths
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Completed Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gradient-to-br from-emerald-400/80 to-emerald-500/80 border-emerald-300/20 hover:border-emerald-200/40 transition-all duration-300 backdrop-blur-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm font-medium">
                  <Trophy className="text-emerald-100" size={18} />
                  Tasks Done
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-white mb-2">
                  {completedTasks}
                </div>
                <div className="text-sm text-white/90">
                  Keep up the momentum!
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/80 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="text-purple-400" />
                  Recent Roadmaps
                </CardTitle>
                <Button 
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={() => navigate('/history')}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentRoadmaps.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No roadmaps yet! Start your learning journey.</p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Create Your First Roadmap
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRoadmaps.slice(0, 5).map((roadmap) => {
                    const isSkillRoadmap = roadmap.roadmapType === 'skill';
                    const title = isSkillRoadmap 
                      ? `Learn ${roadmap.skill} in ${roadmap.timeFrame}`
                      : roadmap.title;
                    
                    return (
                      <motion.div
                        key={roadmap.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                              {isSkillRoadmap ? 'Skill' : 'Career'}
                            </Badge>
                            <h3 className="text-white font-semibold">{title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(roadmap.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Last viewed: {format(new Date(roadmap.lastAccessed), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/history')}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
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

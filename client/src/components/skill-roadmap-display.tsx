import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Target, Clock, Trophy } from "lucide-react";
import { SkillRoadmapContent } from "@shared/schema";

interface SkillRoadmapDisplayProps {
  skillRoadmap: any;
}

export default function SkillRoadmapDisplay({ skillRoadmap }: SkillRoadmapDisplayProps) {
  if (!skillRoadmap || !skillRoadmap.skillContent) {
    return null;
  }

  const content: SkillRoadmapContent = skillRoadmap.skillContent;

  return (
    <section id="skill-roadmap-display" className="w-full max-w-4xl mx-auto mt-8">
      {/* Header Card */}
      <Card className="mb-8 border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-glass">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {skillRoadmap.title}
              </h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Target size={16} className="text-purple-400" />
                  <span className="font-medium">Skill:</span> {content.skill}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} className="text-pink-400" />
                  <span className="font-medium">Timeline:</span> {content.timeFrame}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-white/10 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-300 leading-relaxed">{content.overview}</p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Stages */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="text-purple-400" />
          Learning Stages
        </h3>

        {content.stages.map((stage, index) => (
          <Card 
            key={index}
            className="border-2 border-purple-500/20 shadow-lg bg-white/5 backdrop-blur-glass hover:border-purple-500/40 transition-all duration-300"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center glow-pulse">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{stage.stage}</h4>
                    <p className="text-sm text-gray-400 mt-1">Duration: {stage.duration}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tasks */}
              <div>
                <h5 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Tasks to Complete
                </h5>
                <ul className="space-y-2">
                  {stage.tasks.map((task, taskIdx) => (
                    <li 
                      key={taskIdx}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-200 leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h5 className="text-sm font-semibold text-pink-300 mb-3 flex items-center gap-2">
                  <Target size={16} />
                  Resources
                </h5>
                <ul className="space-y-2">
                  {stage.resources.map((resource, resourceIdx) => (
                    <li 
                      key={resourceIdx}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-200 leading-relaxed">{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestones */}
      <Card className="mt-8 border-2 border-green-500/30 shadow-xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-glass">
        <CardHeader>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-green-400" />
            Milestones
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {content.milestones.map((milestone, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
              >
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200 leading-relaxed font-medium">{milestone}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Expected Outcome */}
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
    </section>
  );
}

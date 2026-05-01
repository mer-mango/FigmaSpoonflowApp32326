import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Plus, Trash2, Package, Save } from 'lucide-react';
import { Service } from '../../../App';

interface LearningObjective {
  id: string;
  text: string;
}

interface Activity {
  id: string;
  description: string;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  topics: string;
  activities: Activity[];
  materials: string;
}

interface WorkshopCurriculumFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  onSaveAndFinishLater?: (data: any) => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
}

export function WorkshopCurriculumForm({ onPreview, onBack, onSave, onSaveAndFinishLater, backButtonLabel = 'Back to Flow Wizard', initialData, services = [] }: WorkshopCurriculumFormProps) {
  // Training header
  const [trainingTitle, setTrainingTitle] = useState(initialData?.trainingTitle || initialData?.workshopTitle || 'Patient Experience Design Thinking Training');
  const [trainingDate, setTrainingDate] = useState(initialData?.trainingDate || initialData?.workshopDate || '2026-01-01');
  const [duration, setDuration] = useState(initialData?.duration || 'Full Day (8 hours)');
  const [audience, setAudience] = useState(initialData?.audience || 'Healthcare executives, patient experience leaders, clinical staff');
  const [facilitator, setFacilitator] = useState(initialData?.facilitator || 'Meredith Mangold, CPXP - Empower Health Strategies');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Training overview
  const [overview, setOverview] = useState(initialData?.overview || 'This interactive training introduces participants to human-centered design principles and practical tools for improving patient experiences. Through hands-on activities and real-world case studies, participants will learn to identify opportunities, generate innovative solutions, and create actionable implementation plans.');

  // Learning objectives
  const [objectives, setObjectives] = useState<LearningObjective[]>(initialData?.objectives || [
    { id: 'obj1', text: 'Understand core principles of design thinking and patient-centered care' },
    { id: 'obj2', text: 'Apply empathy mapping and journey mapping techniques' },
    { id: 'obj3', text: 'Generate and evaluate innovative solutions to patient experience challenges' },
    { id: 'obj4', text: 'Develop actionable implementation plans for your organization' }
  ]);

  // Curriculum modules
  const [modules, setModules] = useState<Module[]>(initialData?.modules || [
    {
      id: 'm1',
      title: 'Introduction to Patient Experience Design',
      duration: '60 minutes',
      topics: 'Design thinking principles, patient-centered care fundamentals, case studies of successful transformations',
      activities: [
        { id: 'a1', description: 'Group discussion: Current patient experience challenges' },
        { id: 'a2', description: 'Case study analysis: Healthcare innovation examples' }
      ],
      materials: 'Slides, case study handouts, discussion guides'
    },
    {
      id: 'm2',
      title: 'Empathy & Discovery',
      duration: '90 minutes',
      topics: 'Patient personas, empathy mapping, stakeholder interviews, observational research',
      activities: [
        { id: 'a3', description: 'Hands-on: Create patient personas for your organization' },
        { id: 'a4', description: 'Practice: Conduct empathy interviews in pairs' }
      ],
      materials: 'Persona templates, empathy map worksheets, interview guides'
    },
    {
      id: 'm3',
      title: 'Journey Mapping Workshop',
      duration: '120 minutes',
      topics: 'Journey mapping methodology, touchpoint identification, pain point analysis, opportunity identification',
      activities: [
        { id: 'a5', description: 'Group activity: Map a complete patient journey' },
        { id: 'a6', description: 'Analysis: Identify key pain points and opportunities' }
      ],
      materials: 'Large format journey map templates, sticky notes, markers'
    },
    {
      id: 'm4',
      title: 'Ideation & Action Planning',
      duration: '90 minutes',
      topics: 'Brainstorming techniques, solution prioritization, feasibility assessment, implementation roadmapping',
      activities: [
        { id: 'a7', description: 'Brainstorming session: Generate improvement ideas' },
        { id: 'a8', description: 'Action planning: Create 90-day implementation plan' }
      ],
      materials: 'Idea cards, prioritization matrices, action plan templates'
    }
  ]);

  // Additional information
  const [prerequisites, setPrerequisites] = useState(initialData?.prerequisites || 'No prior design thinking experience required. Participants should come prepared to share their organizational context and challenges.');
  const [takeaways, setTakeaways] = useState(initialData?.takeaways || 'Digital toolkit with templates and frameworks, implementation playbook, certificate of completion, access to follow-up consultation session');

  const addObjective = () => {
    setObjectives([...objectives, { id: `obj-${Date.now()}`, text: 'New learning objective' }]);
  };

  const removeObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id));
  };

  const updateObjective = (id: string, text: string) => {
    setObjectives(objectives.map(obj => obj.id === id ? { ...obj, text } : obj));
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: `m-${Date.now()}`,
        title: 'New Module',
        duration: '60 minutes',
        topics: '',
        activities: [],
        materials: ''
      }
    ]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const updateModule = (id: string, field: keyof Module, value: any) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addActivity = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          activities: [...m.activities, { id: `a-${Date.now()}`, description: 'New activity' }]
        };
      }
      return m;
    }));
  };

  const removeActivity = (moduleId: string, activityId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          activities: m.activities.filter(a => a.id !== activityId)
        };
      }
      return m;
    }));
  };

  const updateActivity = (moduleId: string, activityId: string, description: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          activities: m.activities.map(a => 
            a.id === activityId ? { ...a, description } : a
          )
        };
      }
      return m;
    }));
  };

  const handlePreview = () => {
    // Save first
    if (onSave) {
      onSave();
    }
    
    // Then preview
    onPreview({
      trainingTitle,
      workshopTitle: trainingTitle, // Keep backwards compatibility
      trainingDate,
      workshopDate: trainingDate, // Keep backwards compatibility
      duration,
      audience,
      facilitator,
      overview,
      objectives,
      modules,
      prerequisites,
      takeaways
    });
  };

  const handleSaveAndFinishLater = () => {
    if (onSaveAndFinishLater) {
      onSaveAndFinishLater({
        trainingTitle,
        workshopTitle: trainingTitle, // Keep backwards compatibility
        trainingDate,
        workshopDate: trainingDate, // Keep backwards compatibility
        duration,
        audience,
        facilitator,
        overview,
        objectives,
        modules,
        prerequisites,
        takeaways
      });
    }
  };

  const loadServiceFromSettings = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceId(serviceId);
      setTrainingTitle(service.name);
      setOverview(service.description || 'This interactive workshop introduces participants to human-centered design principles and practical tools for improving patient experiences.');
      
      // Set duration based on service if it exists in description
      if (service.description && service.description.toLowerCase().includes('full day')) {
        setDuration('Full Day (8 hours)');
      } else if (service.description && service.description.toLowerCase().includes('half day')) {
        setDuration('Half Day (4 hours)');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Training Curriculum Editor</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Design structured learning experiences</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                ← {backButtonLabel}
              </Button>
              {onSaveAndFinishLater && (
                <Button
                  onClick={handleSaveAndFinishLater}
                  className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save and Finish Later
                </Button>
              )}
              <Button
                onClick={handlePreview}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Save and Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Workshop Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Training Information</h2>
              {services.length > 0 && (
                <div className="flex items-center gap-3">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => loadServiceFromSettings(e.target.value)}
                    className="px-4 py-2 border-2 border-[#2f829b] rounded-lg font-['Poppins'] text-[#034863] bg-white hover:bg-[#f5fafb] transition-colors"
                  >
                    <option value="">Select from Services...</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.price} {service.billingCycle}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      if (selectedServiceId) {
                        loadServiceFromSettings(selectedServiceId);
                      }
                    }}
                    disabled={!selectedServiceId}
                    className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Load from Settings
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Training Title
                </label>
                <Input
                  value={trainingTitle}
                  onChange={(e) => setTrainingTitle(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={trainingDate}
                    onChange={(e) => setTrainingDate(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Duration
                  </label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Target Audience
                </label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Facilitator
                </label>
                <Input
                  value={facilitator}
                  onChange={(e) => setFacilitator(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Training Overview</h2>
            <Textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={5}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
            />
          </div>

          {/* Learning Objectives */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Learning Objectives</h2>
              <Button
                onClick={addObjective}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Objective
              </Button>
            </div>
            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={objective.id} className="flex items-center gap-2">
                  <span className="font-['Poppins'] text-[#034863] font-medium min-w-[24px]">{index + 1}.</span>
                  <Input
                    value={objective.text}
                    onChange={(e) => updateObjective(objective.id, e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                  <Button
                    onClick={() => removeObjective(objective.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Modules */}
          {modules.map((module, index) => (
            <div key={module.id} className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Lora'] text-3xl text-[#034863]">Module {index + 1}</h2>
                <Button
                  onClick={() => removeModule(module.id)}
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-['Poppins'] rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Module
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Module Title
                  </label>
                  <Input
                    value={module.title}
                    onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Duration
                  </label>
                  <Input
                    value={module.duration}
                    onChange={(e) => updateModule(module.id, 'duration', e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="e.g., 90 minutes"
                  />
                </div>

                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Topics Covered
                  </label>
                  <Textarea
                    value={module.topics}
                    onChange={(e) => updateModule(module.id, 'topics', e.target.value)}
                    rows={3}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="List the key topics covered in this module..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-['Poppins'] text-sm font-medium text-[#034863] text-[20px]">
                      Activities
                    </label>
                    <Button
                      onClick={() => addActivity(module.id)}
                      size="sm"
                      className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Activity
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {module.activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-2">
                        <Input
                          value={activity.description}
                          onChange={(e) => updateActivity(module.id, activity.id, e.target.value)}
                          className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                          placeholder="Activity description..."
                        />
                        <Button
                          onClick={() => removeActivity(module.id, activity.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Materials Needed
                  </label>
                  <Input
                    value={module.materials}
                    onChange={(e) => updateModule(module.id, 'materials', e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="List materials and resources needed..."
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Module Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={addModule}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] text-xl rounded-lg px-12 py-6"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Additional Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Additional Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Prerequisites
                </label>
                <Textarea
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Participant Takeaways
                </label>
                <Textarea
                  value={takeaways}
                  onChange={(e) => setTakeaways(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-end gap-3 pt-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              ← {backButtonLabel}
            </Button>
            {onSaveAndFinishLater && (
              <Button
                onClick={handleSaveAndFinishLater}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save and Finish Later
              </Button>
            )}
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Save and Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
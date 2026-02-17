import React, { useState } from 'react';
import { ScrollText, ChevronRight, FileText, Clock, Shield, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  lastUpdated: string;
  icon: React.ElementType;
  content?: string; // HTML or Markdown string for full content
  docInfo?: {
    docNo: string;
    ver: string;
    effectiveDate: string;
    preparedBy: string;
    approvedBy: string;
  };
}

const HRPolicy: React.FC = () => {
  const policies: Policy[] = [
    {
      id: '1',
      title: 'Trainer-Trainee Relations Policy',
      category: 'Training',
      description: 'Guidelines for professional conduct, equal opportunity, and conflict resolution between trainers and trainees.',
      lastUpdated: 'May 02, 2024',
      icon: Users,
      docInfo: {
        docNo: 'IATT005 HR',
        ver: '01 (controlled)',
        effectiveDate: '2nd May 2024',
        preparedBy: 'HR Manager',
        approvedBy: 'President'
      },
      content: `
1. Equal Opportunity and Respect:
All trainers and trainees must be treated with fairness, dignity, and respect at all times. Discrimination or harassment of any kind will not be tolerated.

2. Non-Discrimination:
The company prohibits discrimination in any aspect of the trainer-trainee relationship, including recruitment, selection, training, promotion, and compensation, based on race, color, religion, gender, sexual orientation, gender identity, national origin, age, disability, or any other characteristic protected by law.

3. Harassment Prevention:
The company is committed to providing a work environment free from harassment. Harassment based on any protected characteristic, including sexual harassment, is strictly prohibited.

4. Confidentiality:
Trainers must respect the confidentiality of trainees' personal information and any proprietary information shared during training sessions.

5. Professional Conduct:
Trainers are expected to maintain a high standard of professionalism in their interactions with trainees.

6. Feedback Mechanism:
The company provides a mechanism for trainees to provide feedback on their training experience and the conduct of their trainers.

7. Conflict Resolution:
In the event of a conflict between a trainer and a trainee, the company will provide a fair and impartial process for resolution.

8. Code of Ethics:
Trainers must adhere to a code of ethics that promotes honesty, integrity, and professionalism.

9. Continuous Learning:
Trainers must engage in continuous learning to improve their training effectiveness and keep up-to-date with industry best practices.

10. Safety and Security:
The company is committed to providing a safe and secure training environment for all trainees.
      `
    },
    {
      id: '2',
      title: 'Equal Opportunity Policy of IATT',
      category: 'Diversity',
      description: 'Commitment to providing equal opportunities and maintaining a discrimination-free environment.',
      lastUpdated: 'May 02, 2024',
      icon: Users,
      docInfo: {
        docNo: 'IATT002 HR',
        ver: '01 (controlled)',
        effectiveDate: '2nd May 2024',
        preparedBy: 'HR Manager',
        approvedBy: 'President'
      },
      content: `
1. Our company is committed to providing equal opportunities to all employees and applicants for employment without regard to race, color, religion, gender, sexual orientation, gender identity, national origin, age, disability, or any other characteristic protected by law.

2. All employment decisions are based solely on merit, qualifications, and abilities. We do not discriminate in recruitment, hiring, training, promotion, compensation, or other terms and conditions of employment.

3. We provide reasonable accommodation for disabilities to qualified individuals with known disabilities unless doing so would result in an undue hardship.

4. Harassment of any kind will not be tolerated. This includes sexual harassment and harassment based on any protected characteristic. We are committed to maintaining a respectful and inclusive workplace.

5. Employees are encouraged to report issues of discrimination, harassment, or retaliation to their supervisor or HR. All reports will be taken seriously.

6. Our company provides diversity training to employees and management to foster understanding and inclusion within the workplace.

7. All reports of discrimination will be investigated promptly and thoroughly. Confidentiality will be maintained to the extent possible.

8. We encourage inclusion in hiring, training, leadership, and all other aspects of employment. We value diverse perspectives and backgrounds.

9. Zero-tolerance policy for retaliation against anyone who reports discrimination or participates in an investigation. Retaliation is a serious violation of this policy.

10. We are committed to a discrimination-free environment where every employee feels valued, respected, and has the opportunity to reach their full potential.
      `
    },
  ];

  // const categories = ['All', 'Time Off', 'Ethics', 'Work Arrangement', 'Diversity', 'Wellness', 'Security', 'Training'];
  const categories = ['All', 'Training', 'Diversity'];

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPolicies = activeCategory === 'All'
    ? policies
    : policies.filter(policy => policy.category === activeCategory);

  const handlePolicyClick = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg shadow-primary/20 text-white">
            <ScrollText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">HR Policies</h1>
            <p className="text-slate-500 font-medium text-sm">Official company regulations and guidelines</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${category === activeCategory
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPolicies.map((policy) => {
          const PolicyIcon = policy.icon;

          return (
            <div
              key={policy.id}
              onClick={() => handlePolicyClick(policy)}
              className="group bg-white rounded-[2rem] border border-slate-100 p-1 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Visual Strip */}
                <div className="hidden md:flex w-24 bg-slate-50 flex-col items-center justify-center border-r border-slate-50 rounded-l-[1.8rem] group-hover:bg-primary/5 transition-colors">
                  <PolicyIcon className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 p-7 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {policy.category}
                      </span>
                      {policy.docInfo && (
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
                          {policy.docInfo.docNo}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                      {policy.title}
                    </h3>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                      {policy.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                      <div className="flex items-center justify-end gap-2 text-slate-700 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {policy.lastUpdated}
                      </div>
                    </div>

                    <button className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-slate-900/20 group-hover:shadow-primary/30 flex items-center justify-center gap-2">
                      View Policy
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Document Viewer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#f8fafc]">

          {/* Document Header Bar */}
          <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-none mb-1">{selectedPolicy?.title}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPolicy?.docInfo?.docNo || 'INTERNAL DOC'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full hover:bg-slate-100"
            >
              Close Preview
            </Button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">

            {/* Sidebar Info - Desktop */}
            <div className="hidden md:block w-64 bg-slate-50 border-r border-slate-100 p-8 overflow-y-auto shrink-0">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Details</h3>

              <div className="space-y-6">
                {selectedPolicy?.docInfo && (
                  <>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Version</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.docInfo.ver}</span>
                    </div>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Effective Date</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.docInfo.effectiveDate}</span>
                    </div>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Prepared By</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.docInfo.preparedBy}</span>
                    </div>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Approved By</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.docInfo.approvedBy}</span>
                    </div>
                  </>
                )}
                <div className="pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                    <Shield className="w-4 h-4" />
                    Official Document
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <ScrollArea className="flex-1 h-[calc(90vh-80px)] bg-white">
              <div className="max-w-3xl mx-auto p-8 md:p-12">
                {/* Document Paper Effect */}
                <div className="bg-white">

                  {/* Document Title Header */}
                  <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
                      {selectedPolicy?.title}
                    </h1>
                    <div className="flex justify-center gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                      <span>{selectedPolicy?.category}</span>
                      <span>•</span>
                      <span>{selectedPolicy?.docInfo?.effectiveDate}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-slate prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed max-w-none">
                    {selectedPolicy?.content ? (
                      <div className="whitespace-pre-line text-justify">
                        {selectedPolicy.content}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p className="italic">Content unavailable</p>
                      </div>
                    )}
                  </div>

                  {/* Document Footer */}
                  <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Confidential - Internal Use Only</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRPolicy;

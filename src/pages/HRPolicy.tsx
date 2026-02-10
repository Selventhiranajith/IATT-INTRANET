import React, { useState } from 'react';
import { ScrollText, ChevronRight, FileText, Clock, Shield, Users, Briefcase, Heart, X } from 'lucide-react';
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
    // {
    //   id: '1',
    //   title: 'Leave Policy',
    //   category: 'Time Off',
    //   description: 'Guidelines for various types of leaves including casual, sick, earned, and unpaid leaves.',
    //   lastUpdated: 'Jan 15, 2024',
    //   icon: Clock,
    // },
    // {
    //   id: '2',
    //   title: 'Code of Conduct',
    //   category: 'Ethics',
    //   description: 'Expected standards of professional behavior and ethical guidelines for all employees.',
    //   lastUpdated: 'Dec 10, 2023',
    //   icon: Shield,
    // },
    // {
    //   id: '3',
    //   title: 'Remote Work Policy',
    //   category: 'Work Arrangement',
    //   description: 'Guidelines for working from home, hybrid arrangements, and remote collaboration.',
    //   lastUpdated: 'Jan 20, 2024',
    //   icon: Briefcase,
    // },
    // {
    //   id: '4',
    //   title: 'Equal Opportunity',
    //   category: 'Diversity',
    //   description: 'Our commitment to providing equal opportunities and maintaining a diverse workplace.',
    //   lastUpdated: 'Nov 5, 2023',
    //   icon: Users,
    // },
    // {
    //   id: '5',
    //   title: 'Health & Safety',
    //   category: 'Wellness',
    //   description: 'Workplace safety protocols, emergency procedures, and health guidelines.',
    //   lastUpdated: 'Jan 8, 2024',
    //   icon: Heart,
    // },
    // {
    //   id: '6',
    //   title: 'Data Privacy',
    //   category: 'Security',
    //   description: 'Guidelines for handling sensitive information and maintaining data privacy.',
    //   lastUpdated: 'Dec 20, 2023',
    //   icon: Shield,
    // },
    {
      id: '7',
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
      id: '8', // Using '8' to distinguish from previous ones
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
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-primary/10">
          <ScrollText className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">HR Policies</h1>
          <p className="text-slate-500 font-medium mt-1">Company policies and guidelines</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              category === activeCategory
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPolicies.map((policy) => {
          const PolicyIcon = policy.icon;
          
          return (
            <div 
              key={policy.id}
              onClick={() => handlePolicyClick(policy)}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                  <PolicyIcon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {policy.category}
                    </span>
                    <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {policy.lastUpdated}
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-black text-lg tracking-tight mb-3 group-hover:text-primary transition-colors">
                    {policy.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                    {policy.description}
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary flex items-center gap-2 transition-colors">
                  <FileText className="w-4 h-4" />
                  View Policy Details
                </span>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="p-8 pb-4 border-b border-slate-50">
             <DialogHeader>
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                   {selectedPolicy?.category}
                 </span>
                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   Updated: {selectedPolicy?.lastUpdated}
                 </span>
               </div>
               <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                 {selectedPolicy?.title}
               </DialogTitle>
             </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 pt-4">
             {selectedPolicy?.docInfo && (
               <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Doc No</span>
                    <span className="font-black text-slate-900">{selectedPolicy.docInfo.docNo}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Version</span>
                    <span className="font-black text-slate-900">{selectedPolicy.docInfo.ver}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Effective Date</span>
                    <span className="font-black text-slate-900">{selectedPolicy.docInfo.effectiveDate}</span>
                  </div>
                   <div>
                    <span className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Approved By</span>
                    <span className="font-black text-slate-900">{selectedPolicy.docInfo.approvedBy}</span>
                  </div>
               </div>
             )}

             <div className="prose prose-slate prose-sm max-w-none">
                {selectedPolicy?.content ? (
                  <div className="whitespace-pre-line text-slate-600 font-medium leading-relaxed">
                    {selectedPolicy.content}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Full policy content for "{selectedPolicy?.title}" is not available in this preview.</p>
                )}
             </div>
          </div>

          <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex justify-end">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Section */}
      <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm">
               <Shield className="w-6 h-6 text-primary" />
             </div>
             <div>
               <h3 className="text-slate-900 font-black tracking-tight">Have questions about policies?</h3>
               <p className="text-slate-500 text-sm font-medium mt-0.5">Contact HR for clarification on any policy guidelines.</p>
             </div>
          </div>
          <button className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all font-black uppercase tracking-[0.2em] text-sm">
            Contact HR Office
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRPolicy;

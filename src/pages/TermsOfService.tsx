import { useEffect } from 'react';
import CTASection from '../components/common/CTASection';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-slate-50 pt-32 pb-16 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <span className="text-app-purple font-bold uppercase tracking-widest text-sm mb-4 block">
            Legal Agreement
          </span>
          <h1 id="terms-title" className="text-4xl md:text-6xl text-black uppercase font-black tracking-tight leading-tight">
            Terms of <span className="text-app-purple">Service</span>
          </h1>
          <p className="text-slate-500 font-light text-lg mt-4 leading-relaxed max-w-4xl">
            Please read these terms carefully before accessing our website or engaging the digital services of Las Turbo Solar.
          </p>
        </div>
      </div>

      {/* Main Content Sections - Aligned to CTA width using container */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6 space-y-16">
          
          {/* Section 1 */}
          <section id="acceptance-of-terms" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">1.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Acceptance of Terms
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              By accessing this website, requesting a solar property assessment, or engaging the digital services of Las Turbo Solar, you agree to be bound by these Terms of Service and all applicable laws and regulations within the Republic of the Philippines. If you do not agree with any of these terms, you are prohibited from using or accessing this site and our digital service portals.
            </p>
          </section>

          {/* Section 2 */}
          <section id="geographic-limitation" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">2.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Geographic Limitation of Services
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                The engineering, design, distribution, and installation services provided by Las Turbo Solar are strictly limited to properties located within the Northern Philippines (Northern Luzon).
              </p>
              <p>
                Any inquiries, quotation requests, or site evaluation bookings made for properties outside this specific geographic jurisdiction will be handled at our sole discretion and may be rejected without liability.
              </p>
              <p className="bg-slate-50 border-l-4 border-app-purple p-4 rounded-r-xl italic font-normal text-slate-600 shadow-sm">
                All financial projections, return-on-investment (ROI) estimates, and net-metering evaluations are based strictly on the regulatory frameworks of electricity distribution utilities operating within Northern Luzon.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="accuracy-of-information" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">3.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Accuracy of User Information & Property Details
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                To generate valid solar system designs and cost estimates, you may be required to provide specific details regarding your property, structural integrity, and historical energy consumption (such as your utility bills).
              </p>
              <p className="font-bold text-black border-l-4 border-black pl-4">
                You agree to provide accurate, current, and complete information.
              </p>
              <p>
                Las Turbo Solar relies entirely on the data you submit to formulate preliminary technical proposals. We are not liable for system sizing errors, design discrepancies, or deployment delays resulting from inaccurate or falsified information provided by the user.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="estimations-vs-contracts" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">4.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Preliminary Estimations vs. Binding Contracts
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                Any digital quotations, system sizing recommendations, or cost estimations generated through this website are strictly preliminary and non-binding.
              </p>
              <p>
                A definitive agreement for solar hardware acquisition and installation is only established upon the execution of a formal, written Engineering, Procurement, and Construction (EPC) Contract signed by both parties following a comprehensive, in-person engineering site inspection.
              </p>
              <p>
                We reserve the right to adjust structural pricing, hardware specifications, and labor estimates based on the physical realities discovered during the actual on-site technical survey.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="intellectual-property" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">5.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Intellectual Property Rights
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                The content, layout, source code, visual design, custom solar calculators, imagery, and branding assets on this website are the exclusive property of Las Turbo Solar.
              </p>
              <p>
                You are granted a limited, temporary license to view the materials for personal, non-commercial informational purposes only.
              </p>
              <p>
                You may not modify, copy, reverse-engineer, replicate, or use any of our proprietary tools or text for commercial purposes without our express written consent.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="prohibited-uses" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">6.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                User Conduct & Prohibited Uses
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                When interacting with our website, contact forms, or communication portals, you agree not to:
              </p>
              <ul className="space-y-3 pl-6 list-disc text-slate-600">
                <li>Submit fraudulent project requests, spam, or malicious software designed to compromise our digital infrastructure.</li>
                <li>Harvest user data or attempt unauthorized access to our administrative databases.</li>
                <li>Impersonate any individual or misrepresent your affiliation with a property or commercial entity.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="limitation-of-liability" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">7.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Limitation of Liability
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              To the maximum extent permitted by Philippine law, Las Turbo Solar and its affiliates, contractors, or engineers shall not be held liable for any damages (including, without limitation, damages for loss of data, loss of profits, or business interruption) arising out of the use or inability to use the digital materials on this website, even if we have been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          {/* Section 8 */}
          <section id="external-links" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">8.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                External Links and Partnerships
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              Our platform may display references or links to third-party institutions, such as banking partners for green energy financing or local electric cooperatives. Las Turbo Solar does not endorse, monitor, or assume liability for the operational terms, interest rates, or content managed by these independent external entities.
            </p>
          </section>

          {/* Section 9 */}
          <section id="modifications" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">9.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Modifications to Services and Terms
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              We reserve the right to review, update, or alter these Terms of Service at any time without prior notice. By continuing to use this website or engaging our services after changes are published, you accept the revised terms. We advise checking this page periodically to ensure you remain aligned with our current operational policies.
            </p>
          </section>

          {/* Section 10 */}
          <section id="governing-law" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">10.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Governing Law & Jurisdiction
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              Any legal disputes, claims, or actions arising out of these Terms of Service or your interactions with our digital platforms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, and any legal proceedings must be initiated within the appropriate courts of the regional jurisdiction where our primary operations are situated.
            </p>
          </section>

          {/* Section 11 */}
          <section id="contacting-us" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">11.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Contacting Us
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                For any legal clarifications, formal inquiries, or questions regarding these Terms of Service, please contact our management team directly at:
              </p>
              <ul className="space-y-3 pt-4 pl-6 list-disc text-slate-700 text-base md:text-lg">
                <li>
                  <strong className="font-semibold text-black">Email Contact:</strong>{' '}
                  <a href="mailto:lyndon_santos@ymail.com" className="text-app-purple hover:underline font-medium">
                    lyndon_santos@ymail.com
                  </a>
                </li>
                <li>
                  <strong className="font-semibold text-black">Operational Region:</strong> Northern Luzon, Philippines
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>

      {/* CTA Section directly below the full information details */}
      <CTASection />
    </div>
  );
}

import { useEffect } from 'react';
import CTASection from '../components/common/CTASection';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-slate-50 pt-32 pb-16 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <span className="text-app-purple font-bold uppercase tracking-widest text-sm mb-4 block">
            Official Guidelines
          </span>
          <h1 id="privacy-title" className="text-4xl md:text-6xl text-black uppercase font-black tracking-tight leading-tight">
            Privacy <span className="text-app-purple">Policy</span>
          </h1>
          <p className="text-slate-500 font-light text-lg mt-4 leading-relaxed max-w-4xl">
            Please read our commitments to data protection, intellectual property, and compliance with the Philippine Data Privacy Act.
          </p>
        </div>
      </div>

      {/* Main Content Sections - Aligned to CTA width using container */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6 space-y-16">
          
          {/* Section 1 */}
          <section id="brand-intellectual-property" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">1.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Brand Intellectual Property
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              All brand names, logos, custom graphics, and service marks displayed on this platform are the exclusive property of Las Turbo Solar or our authorized partners. Unauthorized replication, modification, or distribution of these assets for any commercial or public intent is strictly prohibited without obtaining our explicit, written approval in advance. For intellectual property inquiries, you may reach out to <a href="mailto:legal@lasturbosolar.com" className="text-app-purple hover:underline font-medium">legal@lasturbosolar.com</a>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="commitments-to-data-privacy" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">2.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Commitments to Data Privacy
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              At Las Turbo Solar, we respect the trust you place in us when sharing your information. This document outlines our transparent practices regarding how we gather, protect, process, and handle your information across our website and digital consultation channels. We design our workflows to safeguard consumer data while delivering sustainable energy solutions across Northern Luzon.
            </p>
          </section>

          {/* Section 3 */}
          <section id="regulatory-alignment-scope" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">3.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Regulatory Alignment & Scope
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                Our data handling methodologies strictly comply with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) alongside local regulatory frameworks. Within this policy, &quot;Personal Information&quot; refers to any data that can uniquely identify you as an individual, such as your contact credentials, property location, or billing details.
              </p>
              <p className="bg-slate-50 border-l-4 border-app-purple p-4 rounded-r-xl italic font-normal text-slate-600 shadow-sm">
                By continuing to navigate this website or submitting your details through our service portals, you acknowledge and agree to the operational practices described herein.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="information-we-evaluate" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">4.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Information We Evaluate
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                To provide accurate solar engineering assessments, system sizing, and client support, we process two distinct categories of information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2 hover:border-app-purple/10 transition-colors">
                  <h3 className="font-bold text-black text-lg font-display">Direct Submissions</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    Data you deliberately provide when requesting a solar quotation, scheduling a site visit, or subscribing to our newsletters. This includes items such as your full name, email address, mobile number, property installation address, and monthly electricity utility figures.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2 hover:border-app-purple/10 transition-colors">
                  <h3 className="font-bold text-black text-lg font-display">Technical Operations Data</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    Analytics collected seamlessly via website interactions. This encompasses system logs, approximate geographic location data, web browser configurations, device operating systems, and traffic patterns regarding the specific project galleries or service pages you visit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="service-utilization-optimization" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">5.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Service Utilization & Optimization
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                We process your information solely to deliver and refine our solar energy services. Specifically, your details enable us to:
              </p>
              <ul className="space-y-3 pl-6 list-disc text-slate-600">
                <li>Generate precise engineering designs and financial return-on-investment profiles for your property.</li>
                <li>Dispatch regional installation technicians and schedule site evaluations within Northern Philippine provinces.</li>
                <li>Distribute technical updates, energy efficiency advice, and corporate announcements (which you can opt out of at any moment).</li>
                <li>Monitor website stability, resolve server errors, and improve digital user experiences.</li>
              </ul>
              <div className="mt-6 p-6 bg-app-purple/5 border border-app-purple/20 rounded-2xl shadow-sm">
                <p className="font-bold text-black text-base uppercase mb-1 font-display">Our Commercial Pledge</p>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  We never monetize your data. Las Turbo Solar does not sell, lease, or rent your personal data to external marketing companies under any circumstances.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="secure-data-exchange" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">6.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Secure Data Exchange
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                We restrict access to your information. Data sharing only occurs under the following structured conditions:
              </p>
              <div className="space-y-4 pl-4 pt-2">
                <div>
                  <h4 className="font-bold text-black text-base font-display">Operational Partners</h4>
                  <p className="text-slate-600 text-sm md:text-base pl-2 font-light">
                    With trusted engineering, financial, or logistics partners who assist directly in executing your solar installation project. These entities are bound by strict confidentiality agreements.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-black text-base font-display">Statutory Obligations</h4>
                  <p className="text-slate-600 text-sm md:text-base pl-2 font-light">
                    When we are legally compelled to disclose information to comply with valid legal processes, judicial orders, or official investigations by Philippine government authorities.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-black text-base font-display">Asset Protection</h4>
                  <p className="text-slate-600 text-sm md:text-base pl-2 font-light">
                    When disclosure is vital to prevent fraud, manage structural risks, or defend the physical safety and property rights of our personnel and community.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="system-safeguards-storage-limits" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">7.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                System Safeguards & Storage Limits
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                We deploy commercial-grade electronic, physical, and administrative security barriers built to prevent data breaches, unauthorized modifications, or accidental loss.
              </p>
              <p>
                Your files are retained only for the duration necessary to fulfill our engineering service agreements, manage product warranties, or meet local accounting and tax auditing requirements under Philippine law. Once data surpasses its structural utility, it is completely purged or permanently anonymized.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="third-party-redirection" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">8.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Third-Party Redirection
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              Our digital platform may contain references or hyperlinks to external websites (such as green energy calculators or financing institutions). Las Turbo Solar holds no administrative oversight over the content, tracking mechanics, or privacy rules of external platforms. We highly recommend reviewing the explicit terms of those individual websites before disclosing personal data.
            </p>
          </section>

          {/* Section 9 */}
          <section id="tracking-pixels-web-cookies" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">9.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Tracking Pixels & Web Cookies
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              We use cookies and digital performance tracking tools (such as Google Analytics) to study user navigation habits. These small files store anonymous operational metrics, allowing us to enhance site speed and deliver tailored content to regional audiences. You can adjust your personal browser preferences to reject cookies, though doing so might limit specific interactive capabilities on our platform.
            </p>
          </section>

          {/* Section 10 */}
          <section id="your-consumer-rights" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">10.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Your Consumer Rights under Philippine Law
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg">
              <p>
                As a data subject in the Philippines, you hold explicit legal protections over your digital footprint. We provide seamless paths for you to exercise the following rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { label: 'Right to Information', desc: 'The right to know if your data is being handled and why.' },
                  { label: 'Right to Access', desc: 'Requesting a clear summary of the personal records we maintain about you.' },
                  { label: 'Right to Correction', desc: 'Updating or rectifying erroneous, old, or incomplete information in our records.' },
                  { label: 'Right to Erasure', desc: 'Demanding the complete removal of your records from our live systems when valid legal criteria are met.' },
                  { label: 'Right to Object', desc: 'Declining further data processing for promotional or marketing campaigns.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-app-purple/10 transition-colors">
                    <h4 className="font-bold text-black text-base font-display">{item.label}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1 font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section id="protection-of-minors" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">11.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Protection of Minors
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              Our clean energy services and web components are curated exclusively for adults and property owners. We do not intentionally compile records from individuals under the age of 18. If it comes to our attention that a minor has submitted personal profiles to us, we will immediately delete the information from our databases.
            </p>
          </section>

          {/* Section 12 */}
          <section id="periodic-policy-adjustments" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">12.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Periodic Policy Adjustments
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed font-light text-base md:text-lg">
              We routinely update this document to reflect structural improvements, changing engineering capabilities, and new legal directives from the National Privacy Commission. Any structural revisions will be posted directly to this page with an updated modification date. Continued use of our digital platforms after revisions implies acceptance of the updated practices.
            </p>
          </section>

          {/* Section 13 */}
          <section id="connecting-with-our-data-team" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xl md:text-2xl font-black text-app-purple font-display">13.</span>
              <h2 className="text-xl md:text-2xl font-black uppercase text-black tracking-tight font-display">
                Connecting with Our Data Team
              </h2>
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed font-light text-base md:text-lg font-light">
              <p>
                If you have questions about how we process your property data, want to correct your contact details, or wish to formally exercise your rights under the Data Privacy Act, please reach out directly to our privacy manager:
              </p>
              <ul className="space-y-3 pt-4 pl-6 list-disc text-slate-700 text-base md:text-lg">
                <li>
                  <strong className="font-semibold text-black">Data Privacy Contact:</strong>{' '}
                  <a href="mailto:lyndon_santos@gmail.com" className="text-app-purple hover:underline font-medium">
                    lyndon_santos@gmail.com
                  </a>
                </li>
                <li>
                  <strong className="font-semibold text-black">Regional Jurisdiction:</strong> Northern Luzon, Philippines
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

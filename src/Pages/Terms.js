import React from 'react';
import Navbar from '../Components/Navbar';

const TermsOfUse = () => {
    return (
        <>
            <Navbar />
            <div className="legal-wrapper">
                <section className="legal-header">
                    <h1>Terms of Use</h1>
                    <p className="legal-date">Effective Date: May 6, 2025</p>
                </section>

                <section className="legal-body">
                    <h5>1. Acceptance of Terms</h5>
                    <p>By accessing or using Youtella.ai, you agree to be bound by these Terms of Use. If you do not agree, please do not use the service.</p>

                    <h5>2. Description of Service</h5>
                    <p>Youtella.ai is an AI-powered tool that provides summaries of YouTube videos. We reserve the right to update or modify the service at any time without notice.</p>

                    <h5>3. Eligibility</h5>
                    <p>You must be at least 13 years old to use Youtella.ai. By using the service, you represent that you meet this requirement.</p>

                    <h5>4. User Conduct</h5>
                    <p>You agree not to misuse Youtella.ai. This includes but is not limited to:</p>
                    <ul>
                        <li>Attempting to reverse-engineer the site</li>
                        <li>Using the service for unlawful or harmful purposes</li>
                        <li>Attempting to disrupt or overload the platform</li>
                    </ul>

                    <h5>5. Intellectual Property</h5>
                    <p>All content, trademarks, and technology used in connection with Youtella.ai remain the property of their respective owners. You may not copy or distribute any part of the service without our written permission.</p>

                    <h5>6. Third-Party Services</h5>
                    <p>Youtella.ai utilizes YouTube’s API Services. By using our site, you also agree to be bound by YouTube’s Terms of Service and Google’s Privacy Policy:</p>
                    <ul>
                        <li><a href='https://www.youtube.com/t/terms'>Youtube Terms</a></li>
                        <li><a href='https://policies.google.com/privacy'>Google Privacy Policies</a></li>
                    </ul>

                    <h5>7. Limitation of Liability</h5>
                    <p>Youtella.ai is provided 'as is' without warranties of any kind. We do not guarantee the accuracy or reliability of summaries, and are not liable for any damages resulting from use of the service.</p>

                    <h5>8. Termination</h5>
                    <p>We reserve the right to suspend or terminate your access to the service at our sole discretion, without notice or liability.</p>

                    <h5>9. Changes to Terms</h5>
                    <p>We may revise these Terms of Use at any time. Continued use of the service after updates constitutes acceptance of the new terms.</p>

                    <h5>10. Contact</h5>
                    <p>If you have questions about these terms, please contact us at <a href="mailto:support@youtella.com">support@youtella.ai</a></p>
                </section>
            </div>
        </>
    );
};

export default TermsOfUse;
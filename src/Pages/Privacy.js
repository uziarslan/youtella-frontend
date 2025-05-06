import React from 'react';
import Navbar from '../Components/Navbar';

const PrivacyPolicy = () => {
    return (
        <>
            <Navbar />
            <div className="legal-wrapper">
                <section className="legal-header">
                    <h1>Privacy Policy</h1>
                    <p className="legal-date">Effective Date: May 6, 2025</p>
                </section>

                <section className="legal-body">
                    <h5>1. Information We Collect</h5>
                    <ul>
                        <li>Email address (if you sign up)</li>
                        <li>Feedback or inquiries</li>
                        <li>IP address, browser type, device info</li>
                        <li>Usage data from your interactions</li>
                        <li>Public YouTube metadata via APIs</li>
                    </ul>

                    <h5>2. How We Use Your Information</h5>
                    <ul>
                        <li>Improve Youtella.ai’s functionality</li>
                        <li>Respond to your inquiries</li>
                        <li>Monitor site usage</li>
                        <li>Prevent fraud or abuse</li>
                    </ul>

                    <h5>3. Cookies and Tracking</h5>
                    <p>We use cookies and similar technologies to remember preferences and enhance user experience. You can disable cookies via your browser settings.</p>

                    <h5>4. Data Sharing</h5>
                    <p>We do not sell or rent your personal data. We may share with trusted service providers or when legally required.</p>

                    <h5>5. Google API Services Disclosure</h5>
                    <p>Youtella.ai uses YouTube API Services. By using our service, you agree to:</p>
                    <ul>
                        <li><a href='https://www.youtube.com/t/terms'>YouTube Terms</a></li>
                        <li><a href='https://policies.google.com/privacy'>Google Privacy Policy</a></li>
                    </ul>
                    <p>You can revoke access via: <a href='https://security.google.com/settings/security/permissions'>click here</a></p>

                    <h5>6. Data Retention</h5>
                    <p>We retain information as long as needed for service provision or as required by law.</p>

                    <h5>7. Your Rights</h5>
                    <p>You may request to access, correct, or delete your data by emailing <a href='mailto:jbhopebooks@yahoo.com'>jbhopebooks@yahoo.com</a>.</p>

                    <h5>8. Security</h5>
                    <p>We take reasonable precautions to protect your data but cannot guarantee absolute security.</p>

                    <h5>9. Children’s Privacy</h5>
                    <p>Youtella.ai is not intended for children under 13. We do not knowingly collect data from minors.</p>

                    <h5>10. Changes to This Policy</h5>
                    <p>We may update this policy and will notify users of significant changes.</p>

                    <h5>11. Contact Us</h5>
                    <p>For any questions, please contact us at: <a href="mailto:support@youtella.com">support@youtella.ai</a></p>
                </section>
            </div>
        </>
    );
};

export default PrivacyPolicy;
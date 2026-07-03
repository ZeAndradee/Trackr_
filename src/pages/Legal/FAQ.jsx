import React, { useState } from "react";
import LegalLayout from "./LegalLayout";
import styles from "./Legal.module.css";
import { FaChevronDown } from "react-icons/fa";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      category: "Account & Security",
      items: [
        {
          question: "How do I reset my password?",
          answer:
            "You can reset your password by clicking on the 'Forgot Password' link on the login page. Follow the instructions sent to your email to create a new password.",
        },
        {
          question: "Can I change my username?",
          answer:
            "Currently, usernames are permanent to ensure unique identification. However, you can change your display name in the profile settings at any time.",
        },
        {
          question: "Is my data secure?",
          answer:
            "Yes, we take security seriously. All your data is encrypted and stored securely. We never share your personal information with third parties without your consent.",
        },
        {
          question: "How do I delete my account?",
          answer:
            "If you wish to delete your account, please contact our support team or go to your Account Settings > Danger Zone > Delete Account. This action is irreversible.",
        },
      ],
    },
    {
      category: "Using Trackr",
      items: [
        {
          question: "How do I track a song?",
          answer:
            "Search for a song using the search bar at the top of the page. Once you find the song you're looking for, click the 'Log' or '+' button to add it to your history or a specific list.",
        },
        {
          question: "Is Trackr free to use?",
          answer:
            "Yes, Trackr is completely free to use. We may introduce premium features in the future, but the core tracking functionality will always remain free for everyone.",
        },
        {
          question: "Can I export my data?",
          answer:
            "Yes, you can export your tracking history and lists. Go to Settings > Data & Privacy and click on 'Export Data' to download a JSON or CSV file of your data.",
        },
        {
          question: "How do I create a custom list?",
          answer:
            "Navigate to your profile or the 'Lists' page and click 'Create New List'. Give it a name and description, and you can start adding songs to it immediately.",
        },
        {
          question: "Why isn't my Spotify syncing?",
          answer:
            "If you're having trouble with Spotify sync, try disconnecting and reconnecting your Spotify account in Settings > Integrations. Ensure you have given all necessary permissions.",
        },
      ],
    },
  ];

  return (
    <LegalLayout title="Frequently Asked Questions">
      {faqData.map((section, sectionIndex) => (
        <section key={sectionIndex} className={styles.section}>
          <h2>{section.category}</h2>
          {section.items.map((item, itemIndex) => {
            const globalIndex = `${sectionIndex}-${itemIndex}`;
            const isOpen = openIndex === globalIndex;

            return (
              <div
                key={itemIndex}
                className={styles.faqItem}
                onClick={() => toggleFAQ(globalIndex)}
              >
                <div className={styles.faqHeader}>
                  <h3>{item.question}</h3>
                  <FaChevronDown
                    className={`${styles.faqIcon} ${isOpen ? styles.open : ""}`}
                  />
                </div>
                {isOpen && (
                  <div className={styles.faqAnswer}>
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </LegalLayout>
  );
};

export default FAQ;

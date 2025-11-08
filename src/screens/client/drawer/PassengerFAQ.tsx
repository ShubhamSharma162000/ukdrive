import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ChevronDown, HelpCircle } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Linking } from 'react-native';

const PassengerFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      section: 'General',
      color: '#f97316',
      items: [
        {
          q: 'How do I book a ride?',
          a: 'Open the UkDrive app, enter your pickup and destination locations, select your vehicle type, and confirm your booking.',
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept UPI, credit/debit cards, and digital wallets for your convenience. Cash payment also accepted.',
        },
        {
          q: 'How do I cancel a ride?',
          a: 'You can cancel a ride from the booking confirmation screen or by calling the driver directly.',
        },
      ],
    },
    {
      section: 'Safety',
      color: '#ea580c',
      items: [
        {
          q: 'How do I ensure my safety during rides?',
          a: 'All our drivers are verified and background checked. You can share your ride details with family and use the SOS feature if needed.',
        },
        {
          q: 'What should I do in case of emergency?',
          a: 'Use the SOS button in the app or call our emergency helpline at 01382-297500 immediately.',
        },
        {
          q: 'Are the vehicles safe and maintained?',
          a: 'Yes, all vehicles undergo regular safety checks and maintenance to ensure your safety.',
        },
      ],
    },

    {
      section: 'Pricing',
      color: '#29d307ff',
      items: [
        {
          q: 'How is the fare calculated?',
          a: 'Fare is calculated based on distance, time, vehicle type, and current demand. You can see the estimated fare before booking.',
        },
        {
          q: 'Are there any night charges?',
          a: 'Yes, there are double charges from 10 PM to 5 AM for night rides.',
        },
        {
          q: 'Can I get a refund if I cancel?',
          a: 'Refund policy depends on the cancellation time. Free cancellation is available within 2 minutes of booking.',
        },
      ],
    },

    {
      section: 'Account',
      color: '#f00a2dff',
      items: [
        {
          q: 'How do I update my profile?',
          a: 'Go to Profile > Edit Profile to update your personal information and email. Your phone number can be updated by contacting our support team or visiting the nearest UkDrive office.',
        },
        {
          q: 'How do I change my phone number?',
          a: 'Your phone number can be updated by contacting our support team or visiting the nearest UkDrive office.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Contact our support team to request account deletion. This process may take 24-48 hours.',
        },
      ],
    },

    {
      section: 'Driver',
      color: '#6d55faff',
      items: [
        {
          q: 'How do I become a UKDrive driver?',
          a: 'You can register directly through the UKDrive Driver App. Upload your driving licence, vehicle documents, and ID proof. Once verified, you will  receive a confirmation and can start accepting rides.',
        },
        {
          q: 'What documents are required for driver registration?',
          a: 'Valid driving licence, Vehicle RC (Registration Certificate), Vehicle insurance, Pollution certificate (PUC), Aadhar card or other ID proof, and Passport-size photo.',
        },
        {
          q: 'How do I receive payments for my rides?',
          a: "Payments are sent directly to your registered bank account. You can view your daily and weekly earnings in the app's Earnings section.",
        },
        {
          q: 'How do I contact a passenger?',
          a: 'For privacy, UKDrive uses a call masking system — you can call or message passengers directly through the app without revealing your personal number.',
        },
        {
          q: 'What should I do if a rider cancels a trip?',
          a: "If a rider cancels after the trip is confirmed, cancellation fees may apply according to UKDrive's policy. You'll see the update instantly in your app.",
        },
        {
          q: 'What if my app is not showing new rides?',
          a: 'Make sure your location is active and internet connection is stable. Try restarting the app. If the issue continues, contact Driver Support.',
        },
        {
          q: 'How can I report an issue or complaint?',
          a: 'Go to the Help section in your driver app → select the trip → choose the issue type (payment, safety, technical, etc.) → submit your complaint. Our support team will assist you shortly.',
        },
        {
          q: 'What areas does UKDrive currently operate in?',
          a: 'We are currently active in Kotdwar and nearby Uttarakhand regions, with more cities launching soon.',
        },
        {
          q: 'Can I drive part-time?',
          a: "Yes! You can drive whenever you're free — full-time or part-time. Just switch your status to Online when you're ready to accept rides.",
        },

        {
          q: 'How can I increase my earnings?',
          a: 'Drive during peak hours, maintain good ratings, and accept rides promptly. Referral and bonus programs also help boost your income.',
        },
      ],
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let indexCounter = 0;

  return (
    <>
      <View
        style={{
          backgroundColor: '#e8e5e4ff',
          paddingTop: 30,
          paddingLeft: 20,
        }}
      >
        <Text sx={{ fontSize: 26, fontWeight: '700', color: '#111827' }}>
          FAQ
        </Text>
        <Text sx={{ color: '#6b7280', mb: 16 }}>
          Frequently asked questions
        </Text>
      </View>
      <ScrollView sx={{ flex: 1, m: 20 }}>
        {faqs.map((section, sIndex) => (
          <View key={sIndex} sx={{ mb: 24 }}>
            <Text
              sx={{
                fontWeight: '700',
                fontSize: 14,
                color: section.color,
                mb: 8,
                mt: sIndex > 0 ? 8 : 0,
              }}
            >
              {section.section}
            </Text>

            {section.items.map(item => {
              const myIndex = indexCounter++;
              const isOpen = openIndex === myIndex;
              return (
                <View
                  key={myIndex}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    p: 16,
                    mb: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Pressable
                    onPress={() => toggle(myIndex)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={2}
                        style={{
                          color: '#111827',
                          fontWeight: '600',
                          fontSize: 16,
                        }}
                      >
                        {item.q}
                      </Text>
                    </View>

                    <ChevronDown color={section.color} size={18} />
                  </Pressable>

                  {isOpen && (
                    <Text
                      sx={{
                        color: '#4b5563',
                        mt: 8,
                        fontSize: 15,
                        lineHeight: 22,
                      }}
                    >
                      {item.a}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <View
          sx={{
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <LinearGradient
            colors={['#f9fafb', '#fffaf5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderRadius: 16,
            }}
          >
            <View sx={{ alignItems: 'center', mb: 16 }}>
              <HelpCircle color="#ea580c" size={28} />
              <Text
                sx={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#111827',
                  mt: 8,
                }}
              >
                Still have questions?
              </Text>
              <Text sx={{ color: '#4b5563', mt: 4 }}>
                We are here to support you 24/7
              </Text>
            </View>

            <Pressable
              onPress={() => Linking.openURL('mailto:support@ukdrive.in')}
              sx={{
                backgroundColor: '#ea580c',
                py: 12,
                borderRadius: 10,
                alignItems: 'center',
                mb: 16,
              }}
            >
              <Text sx={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                Contact Support
              </Text>
            </Pressable>

            <View
              sx={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Pressable onPress={() => Linking.openURL('tel:01382297500')}>
                <Text
                  sx={{
                    color: '#ea580c',
                    textDecorationLine: 'underline',
                    fontSize: 15,
                  }}
                >
                  01382-297500
                </Text>
              </Pressable>

              <Pressable
                onPress={() => Linking.openURL('mailto:support@ukdrive.in')}
              >
                <Text
                  sx={{
                    color: '#ea580c',
                    textDecorationLine: 'underline',
                    fontSize: 15,
                  }}
                >
                  support@ukdrive.in
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </>
  );
};

export default PassengerFAQ;

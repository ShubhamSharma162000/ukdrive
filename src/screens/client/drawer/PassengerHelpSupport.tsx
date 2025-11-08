import React, { useState } from 'react';
import {
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
} from 'react-native';
import { View, Text, ScrollView, TextInput } from 'dripsy';

// Enable animation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqData = [
  {
    question: 'How do I book a ride?',
    answer:
      'To book a ride, open the app, enter your pickup and destination locations, select your preferred vehicle type, and tap "Book Ride". You can track your driver in real-time once the ride is confirmed.',
    tag: 'booking',
    color: '#e0e7ff',
    textColor: '#1e40af',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept UPI, credit/debit cards, and digital wallets for your convenience. Cash payment also accepted.',
    tag: 'payment',
    color: '#dcfce7',
    textColor: '#166534',
  },
  {
    question: 'How can I cancel a ride?',
    answer:
      'You can cancel a ride from the active ride screen by tapping the "Cancel Ride" button. Cancellation charges may apply depending on the timing.',
    tag: 'booking',
    color: '#e0e7ff',
    textColor: '#1e40af',
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'Yes, we use industry-standard security measures to protect your personal information. Your phone number and payment details are encrypted and never shared with drivers.',
    tag: 'safety',
    color: '#fee2e2',
    textColor: '#b91c1c',
  },
  {
    question: 'How do I update my profile?',
    answer:
      'Go to your profile page and tap "Edit Profile" to update your name, email, and other information. Your phone number can be updated by contacting our support team or visiting the nearest UkDrive office.',
    tag: 'account',
    color: '#ede9fe',
    textColor: '#6b21a8',
  },
  {
    question: 'What are night charges?',
    answer:
      'Night charges apply from 10:00 PM to 5:00 AM with a 100% surcharge on the base fare to ensure driver availability during late hours.',
    tag: 'Payment',
    color: '#6df259ff',
    textColor: '#065b15ff',
  },
];

const emergencyContacts = [
  {
    title: 'Police Emergency',
    subtitle: 'For immediate police assistance',
    number: '100',
    color: '#2563eb', // blue
  },
  {
    title: 'Medical Emergency',
    subtitle: 'For ambulance and medical help',
    number: '108',
    color: '#dc2626', // red
  },
  {
    title: 'Women Helpline',
    subtitle: '24/7 support for women in distress',
    number: '1091',
    color: '#8b5cf6', // purple
  },
  {
    title: 'UkDrive Support',
    subtitle: '24/7 ride-related emergencies',
    number: '01382297500',
    color: '#ea580c', // orange
  },
];

const emergencyTips = [
  'Always verify the driver and vehicle details before getting in',
  'Share your trip details with family or friends',
  'Keep your phone charged and accessible',
  'Trust your instincts – if something feels wrong, speak up',
];

export default function PassengerHelpSupport() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'emergency'>(
    'faq',
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [contactUsTitle, setContactUsTitle] = useState('');
  const [contactUsDescription, setContactUsDescription] = useState('');

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === index ? null : index);
  };

  const handleSendEmail = async () => {
    if (!contactUsTitle || !contactUsDescription) {
      Alert.alert('form submit');
      return;
    }

    try {
      const subject = encodeURIComponent(contactUsTitle);
      const body = encodeURIComponent(contactUsDescription);
      const email = 'support@ukdrive.in';

      // If not using Expo MailComposer:
      const url = `mailto:${email}?subject=${subject}&body=${body}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else Alert.alert('No email app available to send message.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not open email client.');
    }
  };

  const ukdrivePhoneNumber = '01382297500';

  const handleCallNow = async () => {
    const url = `tel:${ukdrivePhoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Unable to open dialer');
    }
  };

  const handleEmergencyCall = async (num: string) => {
    const url = `tel:${num}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) Linking.openURL(url);
    else Alert.alert('Unable to open dialer');
  };

  return (
    <>
      <View
        style={{
          backgroundColor: '#e8e5e4ff',
          paddingTop: 30,
          paddingLeft: 20,
        }}
      >
        <Text sx={{ fontSize: 24, fontWeight: '700', mb: 4 }}>
          Help & Support
        </Text>
        <Text sx={{ color: '#6b7280', mb: 16 }}>
          Get assistance for your rides
        </Text>
      </View>
      <ScrollView sx={{ flex: 1, m: 20 }}>
        <View
          sx={{
            flexDirection: 'row',
            backgroundColor: '#f3f4f6',
            borderRadius: 10,
            mb: 20,
            mt: 10,
            overflow: 'hidden',
          }}
        >
          {['faq', 'contact', 'emergency'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                backgroundColor: activeTab === tab ? '#f97316' : 'transparent',
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text
                sx={{
                  color: activeTab === tab ? '#fff' : '#374151',
                  fontWeight: '900',
                  fontSize: 14,
                }}
              >
                {tab === 'faq'
                  ? 'FAQ'
                  : tab === 'contact'
                  ? 'Contact Us'
                  : 'Emergency'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'faq' && (
          <View>
            <Text
              sx={{
                fontSize: 14,
                fontWeight: '700',
                color: '#f97316',
                mb: 20,
              }}
            >
              Frequently Asked Questions
            </Text>

            {faqData.map((item, index) => (
              <View
                key={index}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  mb: 12,
                  p: 10,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >
                <TouchableOpacity onPress={() => toggleExpand(index)}>
                  <View
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontWeight: '600', fontSize: 14, mb: 2 }}>
                        {item.question}
                      </Text>
                      <View
                        sx={{
                          backgroundColor: item.color,
                          borderRadius: 20,
                          alignSelf: 'flex-start',
                          px: 10,
                          py: 4,
                          my: 4,
                        }}
                      >
                        <Text
                          sx={{
                            color: item.textColor,
                            fontWeight: '500',
                            fontSize: 12,
                          }}
                        >
                          {item.tag}
                        </Text>
                      </View>
                    </View>
                    <Text sx={{ fontSize: 18, color: '#f97316', ml: 10 }}>
                      ▼
                    </Text>
                  </View>
                </TouchableOpacity>

                {expanded === index && (
                  <Text sx={{ color: '#4b5563', mt: 10, fontSize: 13 }}>
                    {item.answer}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'contact' && (
          <>
            <View
              sx={{
                borderWidth: 1,
                borderColor: '#cdcfd2ff',
                borderRadius: 12,
                p: 30,
                shadowColor: '#5d5b5bff',
                shadowOpacity: 0.05,
                shadowRadius: 3,
                backgroundColor: '#fff',
              }}
            >
              <Text sx={{ fontSize: 22, fontWeight: '700', mb: 20 }}>
                Get in Touch
              </Text>

              <Text sx={{ fontWeight: '600', mb: 6, fontSize: 14 }}>
                Email To
              </Text>
              <View
                sx={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#545456ff',
                  p: 12,
                  mb: 16,
                }}
              >
                <Text sx={{ color: '#374151', fontSize: 14 }}>
                  support@ukdrive.in
                </Text>
              </View>

              <Text sx={{ fontWeight: '600', mb: 6, fontSize: 14 }}>
                contactUsTitle
              </Text>
              <TextInput
                value={contactUsTitle}
                onChangeText={setContactUsTitle}
                style={{
                  borderWidth: 1,
                  borderColor: '#545456ff',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 14,
                }}
              />
              <Text sx={{ fontWeight: '600', mb: 6, fontSize: 14 }}>
                ContactUsDescription
              </Text>
              <TextInput
                value={contactUsDescription}
                onChangeText={setContactUsDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: '#545456ff',
                  borderRadius: 8,
                  padding: 12,
                  height: 120,
                  fontSize: 16,
                }}
              />

              <Text sx={{ color: '#6b7280', mt: 6, mb: 16, fontSize: 14 }}>
                Response within 24 hours
              </Text>

              <TouchableOpacity
                onPress={handleSendEmail}
                style={{
                  backgroundColor: '#f97316',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text sx={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                  Send Email Support
                </Text>
              </TouchableOpacity>
            </View>
            <View
              sx={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#cdcfd2ff',
                borderRadius: 12,
                p: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 3,
                marginTop: 20,
              }}
            >
              <View>
                <Text sx={{ fontSize: 16, fontWeight: '700', mb: 8 }}>
                  Phone Support
                </Text>
                <Text
                  sx={{
                    color: '#f97316',
                    fontSize: 14,
                    textDecorationLine: 'underline',
                    mb: 4,
                  }}
                  onPress={handleCallNow}
                >
                  {ukdrivePhoneNumber.replace(/(\d{5})(\d{5})/, '$1-$2')}
                </Text>
                <Text sx={{ color: '#6b7280', fontSize: 14 }}>
                  Available 24/7
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCallNow}
                style={{
                  backgroundColor: '#f97316',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
              >
                <Text
                  sx={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  Call Now
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'emergency' && (
          <>
            <View
              sx={{
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
                borderWidth: 1,
                borderRadius: 12,
                p: 16,
                mb: 20,
              }}
            >
              <Text
                sx={{
                  color: '#b91c1c',
                  fontWeight: '700',
                  fontSize: 18,
                  mb: 8,
                }}
              >
                Emergency Contacts
              </Text>
              <Text
                sx={{
                  color: '#991b1b',
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                In case of emergency during your ride, immediately contact the
                authorities:
              </Text>
            </View>

            {/* List of Emergency Contacts */}
            {emergencyContacts.map((item, index) => (
              <View
                key={index}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  p: 16,
                  mb: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View sx={{ flexShrink: 1 }}>
                  <Text sx={{ fontWeight: '700', fontSize: 14, mb: 4 }}>
                    {item.title}
                  </Text>
                  <Text sx={{ color: '#6b7280', fontSize: 12 }}>
                    {item.subtitle}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleEmergencyCall(item.number)}
                  style={{
                    backgroundColor: item.color,
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    sx={{
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    {item.title === 'UkDrive Support'
                      ? 'Call Now'
                      : `Call ${item.number}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <View
              sx={{
                backgroundColor: '#fffbea',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#fde68a',
                p: 16,
                // mx: 16,
                mt: 20,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text
                sx={{
                  color: '#92400e',
                  fontWeight: '700',
                  fontSize: 18,
                  mb: 10,
                }}
              >
                Safety Tips
              </Text>

              {emergencyTips.map((tip, index) => (
                <Text
                  key={index}
                  sx={{
                    color: '#b45309',
                    fontSize: 15,
                    lineHeight: 22,
                    mb: index === emergencyTips.length - 1 ? 0 : 6,
                  }}
                >
                  • {tip}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

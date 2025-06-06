import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { router } from 'expo-router';
import { Activity, BellDot, CalendarClock, Map, MapPin } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EnquiryScreen() {
  const enquiryOptions = [
    {
      id: 'activities',
      title: 'Daily Activities History',
      icon: <Activity size={24} color={Colors.light.accent} />,
      route: '/(tabs)/activity/history',
    },
    {
      id: 'attendance',
      title: 'Clock-in/Clock-out History',
      icon: <CalendarClock size={30} color={Colors.light.secondary} />,
      route: '/(tabs)/attendance/history',
    },
    {
      id: 'notifications',
      title: 'Notification History',
      icon: <BellDot size={24} color={Colors.light.warning} />,
      route: '/notifications/history',
    },
    {
      id: 'territory',
      title: 'Territory History',
      icon: <MapPin size={24} color={Colors.light.tint} />,
      route: '/enquiry/territory',
    },
    {
      id: 'tracking',
      title: 'Live Tracking',
      icon: <Map size={24} color={Colors.light.error} />,
      route: '/enquiry/live-tracking',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader title="Enquiry" rightContent={<View style={{ width: 24 }} />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.optionsContainer}>
          {enquiryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionButton}
              onPress={() => router.push(option?.route as any)}
            >
              <View style={styles.optionIconContainer}>{option.icon}</View>
              <Text style={styles.optionTitle}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Layout.spacing.m,
    paddingBottom: Layout.spacing.xxl,
  },
  optionsContainer: {
    rowGap: Layout.spacing.m,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    ...Layout.shadow.light,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.m,
  },
  optionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
});

import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { router } from 'expo-router';
import { History } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { markAsRead } from '@/api/notification.api';
import AppHeader from '@/components/Header';
import NotificationCard from '@/components/NotificationCard';
import AppStatusBar from '@/components/StatusBar';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { makeFormData } from '@/utils/form-actions';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { notifications: notificationList, isLoading } = useNotifications();

  const handleNotificationPress = (item: INotification) => {
    markAsRead(
      makeFormData({
        sUserID: user?.userID,
        sSessionID: user?.sessionID,
        sCompanyID: user?.companyID,
        sEmployeeCode: user?.employeeCode,
        sReferenceNo: item?.referenceNo,
      })
    );
    router.push({ pathname: '/notifications/[id]', params: { id: item?.referenceNo, ...item } });
  };

  const navigateToHistory = () => {
    router.push('/notifications/history');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="New Notifications"
        withBackButton={true}
        bg="primary"
        rightContent={
          <Pressable onPress={navigateToHistory}>
            <History color={Colors.light.background} />
          </Pressable>
        }
      />

      {isLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ flex: 1 }} size="large" />
      ) : notificationList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No Notifications Found!</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.historyTextButton}
            onPress={navigateToHistory}
          >
            <Text style={styles.historyText}>History</Text>
            <History color={Colors.light.primary} size={20} />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notificationList}
          renderItem={({ item }: { item: INotification }) => (
            <NotificationCard item={item} onPress={handleNotificationPress} isUnread />
          )}
          keyExtractor={(item) => item?.referenceNo}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* {!isLoading && notificationList?.length !== 0 && (
        <View style={styles.footerButtonsContainer}>
          <Pressable
            style={[styles.footerButton, styles.markAllReadButton]}
            // onPress={markAllAsRead}
          >
            <Text style={[styles.footerButtonText, styles.markAllReadText]}>Mark all as read</Text>
          </Pressable>
          <TouchableOpacity style={[styles.footerButton, styles.clearButton]} onPress={clearAll}>
            <Text style={[styles.footerButtonText, styles.clearButtonText]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    marginTop: Layout.spacing.m,
  },
  // footerButtonsContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   padding: Layout.spacing.m,
  //   borderTopWidth: 1,
  //   borderTopColor: Colors.light.border,
  //   backgroundColor: Colors.light.background,
  // },
  // footerButton: {
  //   paddingVertical: Layout.spacing.m,
  //   paddingHorizontal: Layout.spacing.l,
  //   borderRadius: Layout.borderRadius.medium,
  //   alignItems: 'center',
  //   flex: 1,
  //   marginHorizontal: Layout.spacing.xs,
  // },
  // footerButtonText: {
  //   fontFamily: 'Inter-Medium',
  //   fontSize: 15,
  // },
  // markAllReadButton: {
  //   backgroundColor: `${Colors.light.primary}20`,
  // },
  // markAllReadText: {
  //   color: Colors.light.primary,
  // },
  // clearButton: {
  //   backgroundColor: `${Colors.light.error}20`,
  // },
  // clearButtonText: {
  //   color: Colors.light.error,
  // },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  emptyMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
  },
  historyTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.s,
    marginTop: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: `${Colors.light.primary}20`,
    borderRadius: Layout.borderRadius.medium,
  },
  historyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
});

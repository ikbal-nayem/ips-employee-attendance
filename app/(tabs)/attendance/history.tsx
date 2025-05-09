import {
  IAttendanceHistory,
  useAttendanceHistoryInit,
  useAttendanceHistoryList,
} from '@/api/attendance.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Card from '@/components/Card';
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseDate, parseResponseDate } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  AlertTriangle,
  CalendarDays,
  ClockArrowDown,
  ClockArrowUp,
  Edit3,
  MapPin,
  MoveHorizontal,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AttendanceHistoryScreen() {
  const { user } = useAuth();
  const { attendanceHistoryData } = useAttendanceHistoryInit(user?.companyID!);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedAttendanceType, setSelectedAttendanceType] = useState<string | undefined>(
    undefined
  );

  const { attendanceHistoryList, isLoading, error } = useAttendanceHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID!,
    user?.employeeCode!,
    startDate,
    endDate,
    selectedAttendanceType
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (attendanceHistoryData) {
      setStartDate(parseResponseDate(attendanceHistoryData.fromDate));
      setEndDate(parseResponseDate(attendanceHistoryData.toDate));
    }
  }, [attendanceHistoryData]);

  const handleItemPress = (item: IAttendanceHistory) => {
    router.push({
      pathname: '/(tabs)/attendance/[id]',
      params: { id: item?.entryNo, ...item },
    });
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (showDatePicker === 'start' ? startDate : endDate);
    setShowDatePicker(null);
    if (event.type === 'set' && currentDate) {
      if (showDatePicker === 'start') {
        setStartDate(currentDate);
        if (endDate && currentDate > endDate) {
          setEndDate(currentDate);
          attendanceHistoryData;
        }
      } else if (showDatePicker === 'end') {
        setEndDate(currentDate);
      }
    }
  };

  const renderItem = useCallback(({ item, index }: { item: IAttendanceHistory; index: number }) => {
    let statusText = '';
    let statusColor = Colors.light.warning;
    let StatusIcon = AlertTriangle;

    if (item.attendanceFlag === 'I') {
      statusText =
        'In ' +
        parseDate(item.entryTime)?.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      statusColor = Colors.light.success;
      StatusIcon = ClockArrowUp;
    } else if (item.attendanceFlag === 'O') {
      statusText =
        'Out ' +
        parseDate(item?.entryTime!)?.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      statusColor = Colors.light.error;
      StatusIcon = ClockArrowDown;
    }

    return (
      <AnimatedRenderView index={index}>
        <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
          <Card variant="outlined" style={styles.itemContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <CalendarDays size={15} color={Colors.light.primary} />
                <Text style={styles.entryTypeText}>
                  {parseDate(item.entryTime)?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  ({item.entryType})
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <StatusIcon size={14} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>

            {item.attendanceNote && (
              <View style={styles.detailRow}>
                <Edit3 size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.attendanceNote}
                </Text>
              </View>
            )}

            {item.entryLocation && (
              <View style={styles.detailRow}>
                <MapPin size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.entryLocation}
                </Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      </AnimatedRenderView>
    );
  }, []);

  if (error) {
    return <ErrorPreview error={error} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Attendance History"
        withBackButton={true}
        bg="primary"
        rightContent={<View style={{ width: 24 }} />}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.dateButton}
          onPress={() => setShowDatePicker('start')}
        >
          <CalendarDays size={18} color={Colors.light.primary} />
          <Text style={styles.dateButtonText}>
            {startDate ? startDate.toLocaleDateString() : 'Start Date'}
          </Text>
        </TouchableOpacity>
        <MoveHorizontal color={Colors.light.text} />
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.dateButton}
          onPress={() => setShowDatePicker('end')}
        >
          <CalendarDays size={18} color={Colors.light.primary} />
          <Text style={styles.dateButtonText}>
            {endDate ? endDate.toLocaleDateString() : 'End Date'}
          </Text>
        </TouchableOpacity>
        <Select
          options={attendanceHistoryData?.entryTypeList || []}
          keyProp="code"
          valueProp="name"
          value={selectedAttendanceType}
          onChange={(itemValue: string) => setSelectedAttendanceType(itemValue || undefined)}
          placeholder="Type"
          containerStyle={styles.selectFilterContainer}
          selectStyle={styles.selectFilter}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={(showDatePicker === 'start' ? startDate : endDate) || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={showDatePicker === 'end' && startDate ? startDate : undefined}
        />
      )}

      {isLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ flex: 1 }} size="large" />
      ) : attendanceHistoryList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            No attendance records found for the selected period.
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceHistoryList}
          renderItem={renderItem}
          keyExtractor={(item, idx) => item?.entryNo + idx}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.light.border,
    backgroundColor: `${Colors.light.primary}10`,
    borderEndEndRadius: Layout.borderRadius.large,
    borderStartEndRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.m,
    marginTop: -Layout.borderRadius.large,
    paddingTop: Layout.spacing.l,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    marginHorizontal: Layout.spacing.xs,
  },
  dateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: Layout.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  emptyMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  itemContainer: {
    padding: Layout.spacing.m,
    marginHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  entryTypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.light.primary,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs / 1.5,
    paddingHorizontal: Layout.spacing.s,
    borderRadius: Layout.borderRadius.large,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: Layout.spacing.xs / 2,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.subtext,
    marginLeft: Layout.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Layout.spacing.s,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.text,
    marginLeft: Layout.spacing.s,
    flex: 1,
  },
  selectFilterContainer: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
    marginBottom: 0,
  },
  selectFilter: {
    height: Layout.inputHeight - Layout.spacing.m,
    paddingVertical: 0,
    paddingHorizontal: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 0,
  },
});

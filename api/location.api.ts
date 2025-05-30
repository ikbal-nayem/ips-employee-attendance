import { API_CONSTANTS } from '@/constants/api';
import { generateRequestDate } from '@/utils/date-time';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';
import { Alert } from 'react-native';

const LOCATION_UPLOAD_URL = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.LOACTION.SEND_LOCATION}`;

export interface IUserLocationData {
  userId: string;
  userName: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

export interface IEmployeeList {
  code: string;
  name: string;
}

export interface IEmployeeLocation {
  serialNo: string;
  latitude: string;
  location: string;
  longitude: string;
}

// Mock data for live user locations
const mockUserLocations: IUserLocationData[] = [
  {
    userId: '1',
    userName: 'Ikbal',
    imageUrl: 'https://avatars.githubusercontent.com/u/31121811?v=4', // Placeholder image
    location: { latitude: 23.748372, longitude: 90.396734, timestamp: Date.now() - 1000 * 60 * 5 }, // 5 mins ago
  },
  {
    userId: '2',
    userName: 'Mujahid',
    imageUrl: 'https://i.pravatar.cc/150?u=jane.smith', // Placeholder image
    location: {
      latitude: 23.769999068691877,
      longitude: 90.4107950519981,
      timestamp: Date.now() - 1000 * 60 * 2,
    }, // 2 mins ago
  },
  {
    userId: '3',
    userName: 'Alice Johnson',
    imageUrl: 'https://i.pravatar.cc/150?u=alice.johnson', // Placeholder image
    location: {
      latitude: 23.75905247216991,
      longitude: 90.3897508684784,
      timestamp: Date.now() - 1000 * 60 * 10,
    }, // 10 mins ago
  },
  {
    userId: '4',
    userName: 'Bob Williams',
    // No image for this user to test fallback
    location: {
      latitude: 23.78111639688084,
      longitude: 90.39946244398558,
      timestamp: Date.now() - 1000 * 60 * 1,
    }, // 1 min ago
  },
];

export const useFetchUserLiveLocations = () => {
  const [userLocations, setUserLocations] = useState<IUserLocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUserLocations(mockUserLocations);
      setIsLoading(false);
    }, 1500); // Simulate 1.5 second delay
  }, []);

  return { userLocations, isLoading, error };
};

export const useEmployeeList = (companyId: string) => {
  const [employeeList, setEmployeeList] = useState<{
    employeeList: IEmployeeList[];
    processDate: string;
  }>({ employeeList: [], processDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(API_CONSTANTS.LOACTION.INIT, makeFormData({ sCompanyID: companyId }))
      .then((response) => setEmployeeList(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { employeeList, isLoading, error };
};

export const getUserLocationList = async (
  sUserID: string,
  sSessionID: string,
  sCompanyID: string,
  sEmployeeCode: string,
  sProcessDate: string
) => {
  try {
    const formData = makeFormData({
      sUserID,
      sSessionID,
      sCompanyID,
      sEmployeeCode,
      sProcessDate,
    });
    const req = await axiosIns.post(API_CONSTANTS.LOACTION.LIVE_TRACKING, formData);
    if (req.data?.messageCode === '0') {
      return { success: true, data: req.data?.detailsList };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    Alert.alert('Error', JSON.stringify(err));
    return { success: false, message: 'An error occurred while fetching user location.' };
  }
};

export const sendLocationToServer = async (
  latitude: number,
  longitude: number,
  deviceId: string,
  address: string,
  timestamp: number
) => {
  if (!latitude || !longitude || !deviceId) {
    console.error('[BG_TASK] Missing required parameters for location upload');
    return;
  }
  const formdata = new FormData();
  formdata.append('sLatitude', latitude?.toString());
  formdata.append('sLongitude', longitude?.toString());
  formdata.append('sDeviceID', deviceId);
  formdata.append('sLocation', address);
  formdata.append('sTimestamp', generateRequestDate(new Date(timestamp)));
  try {
    const response = await fetchInBackground(LOCATION_UPLOAD_URL, formdata);
    if (response) {
      console.log('Location sent:', response);
    }
  } catch (err) {
    console.error('[BG_TASK] Error uploading location:', err);
  }
};

function fetchInBackground(url: string, formData: FormData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send(formData);
  });
}

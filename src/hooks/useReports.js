import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addReport as addReportFS,
  deleteReport as deleteReportFS,
  subscribeReports
} from '../services/firestoreService';

export function useReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setReports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return subscribeReports(user.uid, (items) => {
      setReports(items);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading reports:', error);
      setIsLoading(false);
    });
  }, [user]);

  const addReport = useCallback(async (reportData) => {
    if (!user) return;
    return await addReportFS(user.uid, {
      ...reportData,
      createdAt: new Date().toISOString()
    });
  }, [user]);

  const deleteReport = useCallback(async (id) => {
    if (!user) return;
    await deleteReportFS(user.uid, id);
  }, [user]);

  return {
    reports,
    isLoading,
    addReport,
    deleteReport
  };
}

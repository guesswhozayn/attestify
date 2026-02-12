import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput
} from 'react-native';
import { Search, Filter, Award, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { credentialAPI } from '../services/api';
import CredentialCard from '../components/CredentialCard';

const CredentialsScreen = ({ navigation }: any) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await credentialAPI.getAll();
      setCredentials(response.data.credentials || []);
    } catch (error) {
      console.error('Credentials fetch error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredCredentials = credentials.filter((cred: any) => 
    cred.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.programName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Credentials</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or type..."
            placeholderTextColor={theme.colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredCredentials}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <CredentialCard 
            credential={item} 
            onPress={() => navigation.navigate('CredentialDetail', { credential: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Award size={48} color={theme.colors.textDim} strokeWidth={1} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No credentials found.</Text>
            {searchQuery ? (
              <Text style={styles.emptySubtext}>Try adjusting your search criteria.</Text>
            ) : (
              <Text style={styles.emptySubtext}>Your issued or received credentials will appear here.</Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  filterBtn: {
    padding: 8,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: theme.colors.textDim,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default CredentialsScreen;

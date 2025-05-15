import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { Input } from '@/components/Input';
import { ItemCard } from '@/components/ItemCard';
import { Button } from '@/components/Button';
import { StolenItem } from '@/types';
import { itemsDb } from '@/services/database';
import { isNetworkConnected } from '@/services/api';
import { Search, Plus, WifiOff } from 'lucide-react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { database, isInitialized } = useDatabase();
  
  const [items, setItems] = useState<StolenItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Load items on initial render
  useEffect(() => {
    if (database && isInitialized) {
      loadItems();
      checkNetworkStatus();
    }
  }, [database, isInitialized]);
  
  // Network status check
  const checkNetworkStatus = async () => {
    const online = await isNetworkConnected();
    setIsOnline(online);
  };
  
  // Load items from database
  const loadItems = async () => {
    try {
      setLoading(true);
      if (database) {
        const fetchedItems = await itemsDb.getAll(database);
        setItems(fetchedItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await checkNetworkStatus();
    await loadItems();
    setRefreshing(false);
  };
  
  // Search handler
  const handleSearch = async () => {
    try {
      setLoading(true);
      if (database) {
        if (searchQuery.trim() === '') {
          await loadItems();
        } else {
          const searchResults = await itemsDb.search(database, searchQuery);
          setItems(searchResults);
        }
      }
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Item press handler
  const handleItemPress = (item: StolenItem) => {
    router.push(`/item/${item.id}`);
  };
  
  // Register new item button handler
  const handleRegisterPress = () => {
    router.push('/register');
  };
  
  // Render item
  const renderItem = ({ item }: { item: StolenItem }) => (
    <ItemCard item={item} onPress={handleItemPress} />
  );
  
  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {searchQuery.trim() !== ''
          ? 'Nenhum item encontrado para esta busca'
          : 'Nenhum item registrado ainda'}
      </Text>
      <Button
        title="Registrar um item"
        onPress={handleRegisterPress}
        style={styles.registerButton}
        size="medium"
        icon={<Plus size={18} color="white" />}
      />
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>RastrelA</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Rastreie seus pertences roubados
        </Text>
      </View>
      
      {!isOnline && (
        <View style={[styles.offlineBar, { backgroundColor: theme.colors.warning }]}>
          <WifiOff size={16} color="#000" />
          <Text style={styles.offlineText}>Modo offline - Sincronização pendente</Text>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar itens roubados..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          leftIcon={<Search size={20} color={theme.colors.secondary} />}
          containerStyle={styles.searchInput}
        />
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  offlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 4,
  },
  offlineText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Inter-Medium',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  registerButton: {
    marginTop: 10,
  },
});
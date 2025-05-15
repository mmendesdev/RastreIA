import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { ItemCard } from '@/components/ItemCard';
import { StolenItem, StolenItemStatus } from '@/types';
import { itemsDb } from '@/services/database';
import { Filter } from 'lucide-react-native';

// Filter options
const STATUS_FILTERS: { value: StolenItemStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'stolen', label: 'Roubados' },
  { value: 'recovered', label: 'Recuperados' },
  { value: 'in_investigation', label: 'Em investigação' },
];

export default function MyItemsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { database, isInitialized } = useDatabase();
  
  const [items, setItems] = useState<StolenItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StolenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StolenItemStatus | 'all'>('all');
  
  // Load items on initial render
  useEffect(() => {
    if (database && isInitialized && user) {
      loadItems();
    }
  }, [database, isInitialized, user]);
  
  // Apply filter when items or status filter changes
  useEffect(() => {
    applyFilter();
  }, [items, statusFilter]);
  
  // Load items from database
  const loadItems = async () => {
    try {
      setLoading(true);
      if (database && user) {
        const fetchedItems = await itemsDb.getByOwner(database, user.id);
        setItems(fetchedItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filter to items
  const applyFilter = () => {
    if (statusFilter === 'all') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) => item.status === statusFilter);
      setFilteredItems(filtered);
    }
  };
  
  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };
  
  // Item press handler
  const handleItemPress = (item: StolenItem) => {
    router.push(`/item/${item.id}`);
  };
  
  // Filter button press handler
  const handleFilterPress = (filter: StolenItemStatus | 'all') => {
    setStatusFilter(filter);
  };
  
  // Render item
  const renderItem = ({ item }: { item: StolenItem }) => (
    <ItemCard item={item} onPress={handleItemPress} />
  );
  
  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {statusFilter !== 'all'
          ? `Você não tem itens com status "${
              STATUS_FILTERS.find((f) => f.value === statusFilter)?.label || ''
            }"`
          : 'Você ainda não registrou nenhum item'}
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Meus Itens</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Gerencie seus itens roubados
        </Text>
      </View>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Filter size={16} color={theme.colors.text} />
          <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
            Filtrar por status
          </Text>
        </View>
        
        <View style={styles.filterButtons}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    statusFilter === filter.value
                      ? theme.colors.primary
                      : theme.colors.card,
                },
              ]}
              onPress={() => handleFilterPress(filter.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      statusFilter === filter.value
                        ? 'white'
                        : theme.colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-Regular',
  },
});
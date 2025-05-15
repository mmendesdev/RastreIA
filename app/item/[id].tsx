import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { StolenItem, StolenItemStatus } from '@/types';
import { itemsDb, syncQueueDb } from '@/services/database';
import { formatDate } from '@/utils/date';
import { CircleAlert as AlertCircle, ArrowLeft, Check, Clock, MapPin, Calendar, Package, Trash2, CreditCard as Edit, Share2 } from 'lucide-react-native';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { database } = useDatabase();
  
  const [item, setItem] = useState<StolenItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Load item on initial render
  useEffect(() => {
    if (database && id) {
      loadItem();
    }
  }, [database, id]);
  
  // Load item from database
  const loadItem = async () => {
    try {
      setLoading(true);
      if (database && id) {
        const fetchedItem = await itemsDb.getById(database, id);
        setItem(fetchedItem);
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao carregar os detalhes do item. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Status badge configuration
  const getStatusConfig = (status: StolenItemStatus) => {
    switch (status) {
      case 'stolen':
        return {
          color: theme.colors.error,
          label: 'Roubado',
          icon: <AlertCircle size={14} color={theme.colors.error} />,
        };
      case 'recovered':
        return {
          color: theme.colors.success,
          label: 'Recuperado',
          icon: <Check size={14} color={theme.colors.success} />,
        };
      case 'in_investigation':
        return {
          color: theme.colors.warning,
          label: 'Em investigação',
          icon: <Clock size={14} color={theme.colors.warning} />,
        };
      default:
        return {
          color: theme.colors.inactive,
          label: 'Desconhecido',
          icon: null,
        };
    }
  };
  
  // Update status handler
  const handleUpdateStatus = async (newStatus: StolenItemStatus) => {
    if (!database || !item || !user) return;
    
    try {
      setUpdatingStatus(true);
      
      // Only owner can update status
      if (item.ownerId !== user.id) {
        Alert.alert(
          'Erro',
          'Você não tem permissão para atualizar o status deste item.'
        );
        return;
      }
      
      // Update item in database
      await itemsDb.update(database, item.id, { status: newStatus });
      
      // Add to sync queue
      await syncQueueDb.add(database, {
        action: 'update',
        entity: 'item',
        entityId: item.id,
        data: { status: newStatus },
      });
      
      // Reload item
      await loadItem();
      
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao atualizar o status. Tente novamente.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Delete item handler
  const handleDeleteItem = async () => {
    if (!database || !item || !user) return;
    
    // Only owner can delete
    if (item.ownerId !== user.id) {
      Alert.alert(
        'Erro',
        'Você não tem permissão para excluir este item.'
      );
      return;
    }
    
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete item from database
              await itemsDb.delete(database, item.id);
              
              // Add to sync queue
              await syncQueueDb.add(database, {
                action: 'delete',
                entity: 'item',
                entityId: item.id,
                data: null,
              });
              
              Alert.alert('Sucesso', 'Item excluído com sucesso!');
              router.back();
            } catch (error) {
              console.error('Delete item error:', error);
              Alert.alert(
                'Erro',
                'Ocorreu um erro ao excluir o item. Tente novamente.'
              );
            }
          },
        },
      ]
    );
  };
  
  // Share item handler
  const handleShareItem = () => {
    Alert.alert(
      'Compartilhar',
      'Recurso em desenvolvimento. Em breve você poderá compartilhar detalhes deste item.'
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  // Render not found state
  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.colors.text }]}>
            Item não encontrado
          </Text>
          <Button
            title="Voltar"
            onPress={() => router.back()}
            style={styles.backButtonLarge}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // Get status configuration
  const statusConfig = getStatusConfig(item.status);
  
  // Placeholder image if no image is provided
  const imageSource = item.imageUri
    ? { uri: item.imageUri }
    : require('@/assets/placeholder-image.png');
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShareItem}
            >
              <Share2 size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            {user && item.ownerId === user.id && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleDeleteItem}
              >
                <Trash2 size={24} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={imageSource} 
            style={styles.image}
            resizeMode="cover"
          />
          
          <View style={[styles.statusBadgeContainer, { backgroundColor: theme.colors.background }]}>
            <Badge 
              label={statusConfig.label}
              color={statusConfig.color}
              icon={statusConfig.icon}
            />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          
          <View style={styles.itemMeta}>
            <View style={styles.metaItem}>
              <Package size={16} color={theme.colors.text} />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {ITEM_TYPES.find(t => t.value === item.type)?.label || 'Outro'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.colors.text} />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={18} color={theme.colors.text} />
            <Text style={[styles.locationText, { color: theme.colors.text }]}>
              {item.location}
            </Text>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Descrição
            </Text>
            <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
              {item.description || 'Sem descrição disponível.'}
            </Text>
          </View>
          
          {user && item.ownerId === user.id && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Atualizar Status
              </Text>
              
              <View style={styles.statusButtons}>
                <Button
                  title="Roubado"
                  onPress={() => handleUpdateStatus('stolen')}
                  variant={item.status === 'stolen' ? 'primary' : 'outline'}
                  size="small"
                  disabled={updatingStatus || item.status === 'stolen'}
                  style={styles.statusButton}
                />
                
                <Button
                  title="Em Investigação"
                  onPress={() => handleUpdateStatus('in_investigation')}
                  variant={item.status === 'in_investigation' ? 'primary' : 'outline'}
                  size="small"
                  disabled={updatingStatus || item.status === 'in_investigation'}
                  style={styles.statusButton}
                />
                
                <Button
                  title="Recuperado"
                  onPress={() => handleUpdateStatus('recovered')}
                  variant={item.status === 'recovered' ? 'primary' : 'outline'}
                  size="small"
                  disabled={updatingStatus || item.status === 'recovered'}
                  style={styles.statusButton}
                />
              </View>
            </View>
          )}
          
          <View style={styles.syncInfo}>
            <Text style={[styles.syncText, { color: theme.colors.text }]}>
              {item.synchronized 
                ? 'Este item está sincronizado com o servidor.' 
                : 'Este item será sincronizado quando você estiver online.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Item type options - copied from register.tsx
const ITEM_TYPES: { value: StolenItemType; label: string }[] = [
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'vehicle', label: 'Veículo' },
  { value: 'jewelry', label: 'Joias' },
  { value: 'document', label: 'Documentos' },
  { value: 'bicycle', label: 'Bicicleta' },
  { value: 'other', label: 'Outro' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadgeContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    borderRadius: 4,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  contentContainer: {
    padding: 20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  itemMeta: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 5,
    fontFamily: 'Inter-Regular',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 5,
    fontFamily: 'Inter-Regular',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    marginRight: 10,
    marginBottom: 10,
  },
  syncInfo: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  syncText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  backButtonLarge: {
    minWidth: 120,
  },
});
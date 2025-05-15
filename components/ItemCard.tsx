import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { StolenItem, StolenItemStatus } from '@/types';
import { Badge } from '@/components/Badge';
import { formatDate } from '@/utils/date';
import { CircleAlert as AlertCircle, Check, Clock } from 'lucide-react-native';

type ItemCardProps = {
  item: StolenItem;
  onPress: (item: StolenItem) => void;
};

export function ItemCard({ item, onPress }: ItemCardProps) {
  const { theme } = useTheme();
  
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
  
  const statusConfig = getStatusConfig(item.status);

  // Card styles based on theme
  const cardStyle = {
    ...styles.card,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  };

  // Placeholder image if no image is provided
  const imageSource = item.imageUri
    ? { uri: item.imageUri }
    : require('@/assets/placeholder-image.png');
  
  return (
    <TouchableOpacity 
      style={cardStyle}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource} 
          style={styles.image}
          resizeMode="cover"
        />
        {!item.synchronized && (
          <View style={styles.syncIndicator}>
            <Text style={styles.syncText}>↻</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        
        <Text 
          style={[styles.description, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.description || 'Sem descrição'}
        </Text>
        
        <View style={styles.footer}>
          <Text style={[styles.date, { color: theme.colors.text }]}>
            {formatDate(item.date)}
          </Text>
          
          <Badge 
            label={statusConfig.label}
            color={statusConfig.color}
            icon={statusConfig.icon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  syncIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    flexGrow: 1,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
});
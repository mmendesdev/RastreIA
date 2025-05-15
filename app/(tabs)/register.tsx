import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { StolenItemType, StolenItemStatus } from '@/types';
import { itemsDb } from '@/services/database';
import { syncQueueDb } from '@/services/database';
import { Camera, MapPin, Calendar, Type, AlignLeft, Image as ImageIcon, CircleCheck as CheckCircle2 } from 'lucide-react-native';

// Item type options
const ITEM_TYPES: { value: StolenItemType; label: string }[] = [
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'vehicle', label: 'Veículo' },
  { value: 'jewelry', label: 'Joias' },
  { value: 'document', label: 'Documentos' },
  { value: 'bicycle', label: 'Bicicleta' },
  { value: 'other', label: 'Outro' },
];

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { database, isInitialized } = useDatabase();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<StolenItemType>('electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    description?: string;
    location?: string;
    date?: string;
  }>({});
  
  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  // Take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'É necessário conceder permissão para acessar a câmera',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  // Validate form
  const validate = () => {
    const newErrors: {
      name?: string;
      type?: string;
      description?: string;
      location?: string;
      date?: string;
    } = {};
    
    if (!name) {
      newErrors.name = 'Nome do objeto é obrigatório';
    }
    
    if (!type) {
      newErrors.type = 'Tipo do objeto é obrigatório';
    }
    
    if (!description) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!location) {
      newErrors.location = 'Localização é obrigatória';
    }
    
    if (!date) {
      newErrors.date = 'Data do roubo é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Register handler
  const handleRegister = async () => {
    if (!validate() || !user || !database) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create item in local database
      const item = {
        name,
        type,
        description,
        location,
        date,
        status: 'stolen' as StolenItemStatus,
        ownerId: user.id,
        imageUri: imageUri || '',
      };
      
      const itemId = await itemsDb.create(database, item);
      
      // Add to sync queue
      await syncQueueDb.add(database, {
        action: 'create',
        entity: 'item',
        entityId: itemId,
        data: item,
      });
      
      Alert.alert(
        'Sucesso',
        'Item registrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setName('');
              setType('electronics');
              setDescription('');
              setLocation('');
              setDate(new Date().toISOString().split('T')[0]);
              setImageUri(null);
              
              // Navigate to my items
              router.push('/my-items');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao registrar o item. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Registrar Item Roubado
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              Preencha todos os campos para registrar seu item roubado
            </Text>
          </View>
          
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={[styles.changeImageButton, { backgroundColor: theme.colors.primary }]}
                  onPress={pickImage}
                >
                  <Text style={styles.changeImageText}>Alterar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { borderColor: theme.colors.border }]}>
                <ImageIcon size={50} color={theme.colors.inactive} />
                <Text style={[styles.imagePlaceholderText, { color: theme.colors.text }]}>
                  Adicione uma foto do item
                </Text>
                <View style={styles.imageButtonsContainer}>
                  <Button
                    title="Galeria"
                    onPress={pickImage}
                    variant="outline"
                    size="small"
                    icon={<ImageIcon size={16} color={theme.colors.primary} />}
                    style={styles.imageButton}
                  />
                  <Button
                    title="Câmera"
                    onPress={takePhoto}
                    variant="outline"
                    size="small"
                    icon={<Camera size={16} color={theme.colors.primary} />}
                    style={styles.imageButton}
                  />
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.form}>
            <Input
              label="Nome do objeto"
              placeholder="Ex: iPhone 15 Pro"
              value={name}
              onChangeText={setName}
              error={errors.name}
              leftIcon={<Type size={20} color={theme.colors.secondary} />}
            />
            
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Tipo do objeto
            </Text>
            <View style={styles.typeContainer}>
              {ITEM_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        type === item.value
                          ? `${theme.colors.primary}20`
                          : theme.colors.card,
                      borderColor:
                        type === item.value
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setType(item.value)}
                >
                  {type === item.value && (
                    <CheckCircle2 
                      size={16} 
                      color={theme.colors.primary} 
                      style={styles.typeCheckIcon} 
                    />
                  )}
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color: theme.colors.text,
                        fontWeight: type === item.value ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.type}
              </Text>
            )}
            
            <Input
              label="Descrição"
              placeholder="Descreva o objeto com detalhes"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              error={errors.description}
              leftIcon={<AlignLeft size={20} color={theme.colors.secondary} />}
              containerStyle={styles.textAreaContainer}
            />
            
            <Input
              label="Local do roubo"
              placeholder="Ex: Av. Paulista, 1000"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
              leftIcon={<MapPin size={20} color={theme.colors.secondary} />}
            />
            
            <Input
              label="Data do roubo"
              placeholder="AAAA-MM-DD"
              value={date}
              onChangeText={setDate}
              error={errors.date}
              leftIcon={<Calendar size={20} color={theme.colors.secondary} />}
            />
            
            <Button
              title="Registrar Item"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButton: {
    marginHorizontal: 6,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  changeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  typeCheckIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    marginTop: -12,
    marginBottom: 16,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  textAreaContainer: {
    height: 120,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 20,
  },
});
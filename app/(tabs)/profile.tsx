import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Switch, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/Button';
import { syncQueueDb } from '@/services/database';
import { Moon, Sun, LogOut, RefreshCw, CircleUser as UserCircle, Bell, Shield, CircleHelp as HelpCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { database } = useDatabase();
  
  // Profile sections
  const sections = [
    {
      title: 'Notificações',
      icon: <Bell size={20} color={theme.colors.primary} />,
      action: () => {
        Alert.alert(
          'Notificações',
          'Recurso em desenvolvimento. Em breve você poderá configurar suas notificações.',
          [{ text: 'OK' }]
        );
      },
    },
    {
      title: 'Segurança',
      icon: <Shield size={20} color={theme.colors.primary} />,
      action: () => {
        Alert.alert(
          'Segurança',
          'Recurso em desenvolvimento. Em breve você poderá configurar suas opções de segurança.',
          [{ text: 'OK' }]
        );
      },
    },
    {
      title: 'Ajuda e Suporte',
      icon: <HelpCircle size={20} color={theme.colors.primary} />,
      action: () => {
        Alert.alert(
          'Ajuda e Suporte',
          'Recurso em desenvolvimento. Em breve você poderá acessar nossa central de ajuda.',
          [{ text: 'OK' }]
        );
      },
    },
  ];
  
  // Sync queue handler
  const handleSyncQueue = async () => {
    if (!database) return;
    
    try {
      Alert.alert(
        'Sincronização',
        'Recurso em desenvolvimento. Em breve você poderá sincronizar seus dados manualmente.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro durante a sincronização. Tente novamente mais tarde.'
      );
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sim, sair',
          onPress: signOut,
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Perfil</Text>
        </View>
        
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.avatarContainer}>
            <UserCircle size={80} color={theme.colors.primary} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>
              {user?.name || 'Usuário'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.colors.text }]}>
              {user?.email || 'email@exemplo.com'}
            </Text>
            <View style={styles.profileRole}>
              <Text style={[styles.profileRoleText, { color: theme.colors.primary }]}>
                {user?.role === 'authority' ? 'Autoridade' : 'Cidadão'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {isDark ? (
                <Moon size={20} color={theme.colors.primary} />
              ) : (
                <Sun size={20} color={theme.colors.primary} />
              )}
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Tema Escuro
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
              thumbColor={isDark ? theme.colors.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <Button
            title="Sincronizar Dados"
            onPress={handleSyncQueue}
            variant="outline"
            icon={<RefreshCw size={18} color={theme.colors.primary} />}
            style={styles.syncButton}
          />
        </View>
        
        <View style={[styles.sectionsCard, { backgroundColor: theme.colors.card }]}>
          {sections.map((section, index) => (
            <React.Fragment key={section.title}>
              <TouchableSection
                title={section.title}
                icon={section.icon}
                onPress={section.action}
                textColor={theme.colors.text}
              />
              {index < sections.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: theme.colors.border }]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        
        <View style={styles.logoutContainer}>
          <Button
            title="Sair"
            onPress={handleLogout}
            variant="danger"
            icon={<LogOut size={18} color="white" />}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            RastrelA v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Touchable section component
type TouchableSectionProps = {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  textColor: string;
};

const TouchableSection: React.FC<TouchableSectionProps> = ({
  title,
  icon,
  onPress,
  textColor,
}) => {
  return (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.sectionLeft}>
        {icon}
        <Text style={[styles.sectionText, { color: textColor }]}>{title}</Text>
      </View>
      <Text style={styles.sectionArrow}>›</Text>
    </TouchableOpacity>
  );
};

// Add this import at the top of the file
import { TouchableOpacity } from 'react-native';

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
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
    fontFamily: 'Inter-Regular',
  },
  profileRole: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  profileRoleText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  settingsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
  },
  syncButton: {
    marginTop: 4,
  },
  sectionsCard: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
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
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
  },
  sectionArrow: {
    fontSize: 20,
    opacity: 0.5,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  logoutContainer: {
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
});
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export function AuthScreen() {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async () => {
    try {
      if (isRegisterMode) {
        await register({ username, password, displayName });
      } else {
        await login({ username, password });
      }
    } catch {
      // erro exposto pelo contexto
    }
  };

  const handleDefaultLogin = async () => {
    try {
      await login({ username: 'admin', password: '123456' });
    } catch {
      // noop
    }
  };

  const toggleMode = () => {
    clearError();
    setIsRegisterMode(prev => !prev);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Card style={styles.card} mode="elevated" elevation={2}>
          <Card.Content style={styles.cardContent}>
            <Text variant="headlineSmall" style={styles.title}>
              English Dictionary
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {isRegisterMode
                ? 'Crie uma conta para guardar seus favoritos e histórico.'
                : 'Acesse sua conta para sincronizar favoritos e palavras vistas.'}
            </Text>

            {error ? (
              <View testID="auth-error-banner" style={styles.errorContainer}>
                <HelperText type="error" visible={true} style={styles.errorText}>
                  {error}
                </HelperText>
              </View>
            ) : null}

            {isRegisterMode && (
              <TextInput
                testID="auth-displayname-input"
                mode="outlined"
                label="Nome"
                placeholder="Seu nome"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                style={styles.input}
              />
            )}

            <TextInput
              testID="auth-username-input"
              mode="outlined"
              label="Usuário"
              placeholder="Digite seu usuário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <TextInput
              testID="auth-password-input"
              mode="outlined"
              label="Senha"
              placeholder="••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <Button
              testID="auth-submit-button"
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}>
              {isRegisterMode ? 'Cadastrar' : 'Entrar'}
            </Button>

            <Button
              testID="auth-demo-button"
              mode="contained-tonal"
              onPress={handleDefaultLogin}
              disabled={isLoading}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}>
              Acesso rápido (admin / 123456)
            </Button>

            <Button
              testID="auth-toggle-mode-button"
              mode="text"
              onPress={toggleMode}
              style={styles.switchModeButton}>
              {isRegisterMode ? 'Já tenho conta' : 'Criar uma nova conta'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  cardContent: {
    paddingVertical: 12,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  errorText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
  input: {
    marginBottom: 14,
    backgroundColor: theme.colors.surface,
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 10,
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  switchModeButton: {
    marginTop: 10,
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { geocodeAddress, GeocodingResult } from '../services/routing';

interface SearchBarProps {
  placeholder?: string;
  onSelect: (result: GeocodingResult) => void;
}

export function SearchBar({ placeholder = 'Search destination…', onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (text.length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await geocodeAddress(text);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = (result: GeocodingResult) => {
    setQuery(result.displayName.split(',')[0]);
    setResults([]);
    Keyboard.dismiss();
    onSelect(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#888"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {loading && <ActivityIndicator size="small" color="#4285F4" style={styles.spinner} />}
      </View>
      {results.length > 0 && (
        <FlatList
          style={styles.results}
          keyboardShouldPersistTaps="handled"
          data={results}
          keyExtractor={item => item.coordinate.latitude + ',' + item.coordinate.longitude}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.displayName}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#222',
  },
  spinner: {
    marginLeft: 8,
  },
  results: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 220,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});

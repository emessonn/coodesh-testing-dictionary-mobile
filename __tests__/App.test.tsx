import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import App from '../App';
import { createAppContainer } from '../src/di/container';
import {
  LocalDatabase,
  StorageAdapter,
} from '../src/infra/storage/LocalDatabase';

class MemoryStorage implements StorageAdapter {
  private map = new Map<string, string>();
  async getItem(key: string): Promise<string | null> {
    return this.map.get(key) ?? null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.map.delete(key);
  }
}

describe('App', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;
  });

  it('logs in, lists words, navigates with Próximo/Voltar in details modal, favorites a word and switches tabs', async () => {
    const db = new LocalDatabase(new MemoryStorage());
    const container = createAppContainer(db);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<App container={container} />);
    });

    const quickLoginBtn = renderer.root.findByProps({
      testID: 'auth-demo-button',
    });

    await act(async () => {
      quickLoginBtn.props.onPress();
    });

    const homeScreen = renderer.root.findByProps({ testID: 'home-screen' });
    expect(homeScreen).toBeTruthy();

    const helloCell = renderer.root.findByProps({
      testID: 'word-cell-hello',
    });

    await act(async () => {
      helloCell.props.onPress('hello');
    });

    const detailTitle = renderer.root.findByProps({
      testID: 'detail-word-title',
    });
    expect(detailTitle.props.children).toBe('hello');

    // Navigate to next word ("today") via Próximo button
    const nextButton = renderer.root.findByProps({
      testID: 'next-word-button',
    });
    await act(async () => {
      nextButton.props.onPress();
    });

    const nextTitle = renderer.root.findByProps({
      testID: 'detail-word-title',
    });
    expect(nextTitle.props.children).toBe('today');

    // Navigate back to previous word ("hello") via Voltar button
    const prevButton = renderer.root.findByProps({
      testID: 'prev-word-button',
    });
    await act(async () => {
      prevButton.props.onPress();
    });

    const backTitle = renderer.root.findByProps({
      testID: 'detail-word-title',
    });
    expect(backTitle.props.children).toBe('hello');

    const favButton = renderer.root.findByProps({
      testID: 'toggle-favorite-button',
    });
    await act(async () => {
      favButton.props.onPress();
    });

    const closeButton = renderer.root.findByProps({
      testID: 'close-detail-button',
    });
    await act(async () => {
      closeButton.props.onPress();
    });

    const favoritesTab = renderer.root.findByProps({
      testID: 'tab-favorites',
    });
    await act(async () => {
      favoritesTab.props.onPress();
    });

    expect(
      renderer.root.findByProps({ testID: 'word-cell-hello' }),
    ).toBeTruthy();

    const historyTab = renderer.root.findByProps({
      testID: 'tab-history',
    });
    await act(async () => {
      historyTab.props.onPress();
    });

    expect(
      renderer.root.findByProps({ testID: 'word-cell-hello' }),
    ).toBeTruthy();

    await act(async () => {
      renderer.unmount();
    });
  });
});

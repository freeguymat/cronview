const { handleExpressionInput } = require('./handlers');

describe('handleExpressionInput', () => {
  let mockComponents;

  beforeEach(() => {
    mockComponents = {
      runsBox: { setItems: jest.fn() },
      infoBox: { setContent: jest.fn() },
      statusBar: { setContent: jest.fn() },
      screen: { render: jest.fn() }
    };
  });

  test('handles empty expression gracefully', () => {
    handleExpressionInput('', mockComponents);
    expect(mockComponents.statusBar.setContent).toHaveBeenCalledWith(
      expect.stringContaining('No expression')
    );
    expect(mockComponents.screen.render).toHaveBeenCalled();
  });

  test('handles invalid expression', () => {
    handleExpressionInput('not a cron', mockComponents);
    expect(mockComponents.infoBox.setContent).toHaveBeenCalledWith(
      expect.stringContaining('Invalid')
    );
    expect(mockComponents.runsBox.setItems).toHaveBeenCalledWith(['Invalid expression']);
  });

  test('handles valid expression and populates runs', () => {
    handleExpressionInput('* * * * *', mockComponents);
    expect(mockComponents.runsBox.setItems).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringMatching(/^\s1\./)]) 
    );
    expect(mockComponents.infoBox.setContent).toHaveBeenCalledWith(
      expect.stringContaining('Expression')
    );
  });

  test('handles valid expression with specific schedule', () => {
    handleExpressionInput('0 9 * * 1-5', mockComponents);
    expect(mockComponents.runsBox.setItems).toHaveBeenCalled();
    const items = mockComponents.runsBox.setItems.mock.calls[0][0];
    expect(items).toHaveLength(10);
  });

  test('trims whitespace from expression', () => {
    handleExpressionInput('  * * * * *  ', mockComponents);
    expect(mockComponents.infoBox.setContent).toHaveBeenCalledWith(
      expect.stringContaining('* * * * *')
    );
  });
});

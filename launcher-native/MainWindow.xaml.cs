using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace Foresight.Launcher;

public partial class MainWindow : Window
{
    private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(5) };
    private readonly string _appUrl;

    public MainWindow()
    {
        InitializeComponent();
        _appUrl = LoadAppUrl();
    }

    private static string LoadAppUrl()
    {
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "launcher-config.json");
            if (!File.Exists(path)) return "http://localhost:3000";
            using var document = JsonDocument.Parse(File.ReadAllText(path));
            return document.RootElement.GetProperty("appUrl").GetString()?.TrimEnd('/') ?? "http://localhost:3000";
        }
        catch { return "http://localhost:3000"; }
    }

    private void Window_Loaded(object sender, RoutedEventArgs e)
    {
        MainContent.BeginAnimation(OpacityProperty, new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(520)) { EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut } });
        if (MainContent.RenderTransform is TranslateTransform transform)
            transform.BeginAnimation(TranslateTransform.YProperty, new DoubleAnimation(18, 0, TimeSpan.FromMilliseconds(620)) { EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut } });
        UsernameInput.Focus();
    }

    private async void Connect_Click(object sender, RoutedEventArgs e)
    {
        var username = Regex.Replace(UsernameInput.Text.Trim().TrimStart('@'), "[^a-zA-Z0-9_-]", "");
        var sessionId = Regex.Replace(SessionInput.Text.Trim().ToUpperInvariant(), "[^A-Z2-9]", "");
        if (username.Length < 2 || sessionId.Length != 8)
        {
            SetStatus("ENTER USERNAME AND 8-CHARACTER SESSION ID", false);
            return;
        }

        ConnectButton.IsEnabled = false;
        ConnectButton.Content = "VERIFYING SESSION...";
        ClientStatus.Text = "CONNECTING";
        ClientStatus.Foreground = new SolidColorBrush(Color.FromRgb(245, 199, 104));
        SetStatus("CONTACTING FORESIGHT API", true);

        try
        {
            var response = await _http.GetAsync($"{_appUrl}/api/radar/sessions/{sessionId}");
            if (!response.IsSuccessStatusCode) throw new InvalidOperationException("SESSION NOT FOUND OR CLOSED");
            var session = await response.Content.ReadFromJsonAsync<SessionLookup>();
            if (session is null || !string.Equals(session.Username, username, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("PLAYER DOES NOT MATCH SESSION");

            ClientStatus.Text = "CONNECTED";
            ClientStatus.Foreground = new SolidColorBrush(Color.FromRgb(72, 214, 157));
            SetStatus($"SESSION {session.SessionId} VERIFIED / OPENING RADAR", true);
            OpenUrl($"{_appUrl}/radar/{Uri.EscapeDataString(session.Username)}/{session.SessionId}");
        }
        catch (Exception exception)
        {
            ClientStatus.Text = "STANDBY";
            ClientStatus.Foreground = new SolidColorBrush(Color.FromRgb(245, 199, 104));
            SetStatus(exception.Message.ToUpperInvariant(), false);
        }
        finally
        {
            ConnectButton.IsEnabled = true;
            ConnectButton.Content = "CONNECT TO RADAR";
        }
    }

    private void SetStatus(string text, bool success)
    {
        StatusText.Text = text;
        StatusText.Foreground = new SolidColorBrush(success ? Color.FromRgb(72, 214, 157) : Color.FromRgb(255, 105, 116));
    }

    private static void OpenUrl(string url) => Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
    private void OpenDemo_Click(object sender, RoutedEventArgs e) => OpenUrl($"{_appUrl}/demo");
    private void OpenDashboard_Click(object sender, RoutedEventArgs e) => OpenUrl($"{_appUrl}/dashboard");
    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e) { if (e.ButtonState == MouseButtonState.Pressed) DragMove(); }
    private void Minimize_Click(object sender, RoutedEventArgs e) => WindowState = WindowState.Minimized;
    private void Close_Click(object sender, RoutedEventArgs e) => Close();

    private sealed class SessionLookup
    {
        public string SessionId { get; set; } = "";
        public string Username { get; set; } = "";
        public string Map { get; set; } = "";
        public string Status { get; set; } = "";
    }
}

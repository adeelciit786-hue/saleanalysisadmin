"""
Champion Cleaners Sales Dashboard - Admin Interface (Streamlit)
Secure admin panel for data upload and forecasting
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import sys
import os
from pathlib import Path
import traceback

# Page configuration MUST be FIRST
st.set_page_config(
    page_title="Admin Dashboard - Champion Cleaners",
    page_icon="🔐", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent / 'sales_app'))

IMPORTS_OK = True
try:
    from excel_loader import ExcelLoader
    from forecast import SalesForecaster
    from visualizer import SalesVisualizer
    from utils import to_float
except ImportError as e:
    st.error(f"Import Error: {str(e)}")
    st.warning("Modules will be available once dependencies finish installing")
    IMPORTS_OK = False

# Custom CSS
st.markdown("""
<style>
    .main {
        padding: 2rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .login-container {
        max-width: 400px;
        margin: auto;
        padding: 2rem;
    }
</style>
""", unsafe_allow_html=True)

# Admin credentials (CHANGE IN PRODUCTION!)
ADMIN_CREDENTIALS = {
    'admin': 'admin123'  # In production, use hashed passwords
}

# Session state initialization
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'username' not in st.session_state:
    st.session_state.username = None
if 'login_time' not in st.session_state:
    st.session_state.login_time = None
if 'historical_data' not in st.session_state:
    st.session_state.historical_data = None
if 'current_month_data' not in st.session_state:
    st.session_state.current_month_data = None
if 'target_sales' not in st.session_state:
    st.session_state.target_sales = None

# Check session timeout (24 hours)
def check_session_timeout():
    if st.session_state.authenticated and st.session_state.login_time:
        elapsed = datetime.now() - st.session_state.login_time
        if elapsed > timedelta(hours=24):
            st.session_state.authenticated = False
            st.session_state.username = None
            st.rerun()

def login_page():
    """Render login page"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("# 🔐 Admin Portal")
        st.markdown("### Champion Cleaners Sales Dashboard")
        st.divider()
        
        username = st.text_input("Username", key="login_username")
        password = st.text_input("Password", type="password", key="login_password")
        
        if st.button("🔓 Sign In", use_container_width=True):
            if username in ADMIN_CREDENTIALS and ADMIN_CREDENTIALS[username] == password:
                st.session_state.authenticated = True
                st.session_state.username = username
                st.session_state.login_time = datetime.now()
                st.success(f"✅ Welcome, {username}!")
                st.balloons()
                st.rerun()
            else:
                st.error("❌ Invalid username or password")

def logout():
    """Handle logout"""
    st.session_state.authenticated = False
    st.session_state.username = None
    st.session_state.login_time = None
    st.success("✓ Logged out successfully")
    st.rerun()

def admin_panel():
    """Main admin panel"""
    
    # Header with user info and logout
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("# 📊 Champion Cleaners")
        st.markdown("### Sales Forecasting Administration Panel")
    with col2:
        st.markdown(f"👤 **{st.session_state.username}**")
        if st.button("🚪 Logout", key="logout_btn"):
            logout()
    
    st.divider()
    
    # Create tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "📁 Upload Data",
        "📊 Dashboard",
        "⚙️ Settings",
        "ℹ️ About"
    ])
    
    # TAB 1: Upload Data
    with tab1:
        st.markdown("## Upload Historical Data")
        st.info("📌 Upload Excel files for November and December (or any 2+ months of historical sales data)")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### Step 1: Historical Data")
            historical_files = st.file_uploader(
                "Select Excel files",
                type=['xlsx', 'xls'],
                accept_multiple_files=True,
                key="historical_upload"
            )
            
            if historical_files:
                for file in historical_files:
                    with st.spinner(f"Processing {file.name}..."):
                        try:
                            # Save temp file
                            temp_path = f"temp_{file.name}"
                            with open(temp_path, 'wb') as f:
                                f.write(file.getbuffer())
                            
                            # Load and parse
                            loader = ExcelLoader(temp_path)
                            if loader.load():
                                # Build data dict from loader
                                data_dict = {
                                    'month': loader.month_name,
                                    'dates': loader.dates,
                                    'weekdays': loader.weekdays,
                                    'totals': loader.daily_totals,
                                    'branches': loader.branches
                                }
                                st.session_state.historical_data = [data_dict]
                                st.success(f"✅ Loaded {file.name}")
                            else:
                                st.error(f"❌ Failed to load {file.name}")
                            
                            # Clean up
                            try:
                                os.remove(temp_path)
                            except:
                                pass
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
        
        with col2:
            st.markdown("### Step 2: Current Month Data")
            current_file = st.file_uploader(
                "Select current month file",
                type=['xlsx', 'xls'],
                key="current_upload"
            )
            
            if current_file:
                with st.spinner(f"Processing {current_file.name}..."):
                    try:
                        temp_path = f"temp_{current_file.name}"
                        with open(temp_path, 'wb') as f:
                            f.write(current_file.getbuffer())
                        
                        loader = ExcelLoader(temp_path)
                        if loader.load():
                            # Build data dict from loader
                            data_dict = {
                                'month': loader.month_name,
                                'dates': loader.dates,
                                'weekdays': loader.weekdays,
                                'totals': loader.daily_totals,
                                'branches': loader.branches
                            }
                            st.session_state.current_month_data = [data_dict]
                            st.success(f"✅ Loaded {current_file.name}")
                        else:
                            st.error(f"❌ Failed to load {current_file.name}")
                        
                        try:
                            os.remove(temp_path)
                        except:
                            pass
                    except Exception as e:
                        st.error(f"Error: {str(e)}")
        
        st.divider()
        
        # Set target (optional)
        st.markdown("### Step 3: Set Monthly Target (Optional)")
        target = st.number_input(
            "Monthly Sales Target (AED)",
            min_value=0.0,
            step=1000.0,
            key="target_input"
        )
        
        if target > 0:
            st.session_state.target_sales = target
            st.success(f"✅ Target set: AED {target:,.0f}")
    
    # TAB 2: Dashboard
    with tab2:
        if not IMPORTS_OK:
            st.warning("⚠️ Modules loading... Please refresh in 30 seconds")
            st.info("Dependencies are being installed on Streamlit Cloud")
            return
        
        if st.session_state.historical_data is None or len(st.session_state.historical_data) == 0:
            st.warning("⚠️ Please upload historical data first in the Upload Data tab")
        else:
            st.markdown("## Forecasting Dashboard")
            
            try:
                # Create forecaster and visualizer
                forecaster = SalesForecaster(st.session_state.historical_data)
                weekday_averages = forecaster.get_weekday_averages()
                
                # forecast_month returns a dict with 'forecast' key and other metadata
                forecast_data = forecaster.forecast_month('JANUARY', st.session_state.target_sales)
                
                viz = SalesVisualizer()
                
                # KPIs
                col1, col2, col3, col4, col5 = st.columns(5)
                
                today = datetime.now()
                today_sales = to_float(forecast_data.get('today_sales', 0), 0)
                total_projected = to_float(forecast_data.get('total_projected', 0), 0)
                gap = to_float(forecast_data.get('projected_vs_target', 0), 0) if st.session_state.target_sales else 0
                
                with col1:
                    st.metric("Today", today.strftime("%d %b"))
                with col2:
                    st.metric("Projected Today", f"AED {today_sales:,.0f}")
                with col3:
                    st.metric("Monthly Projection", f"AED {total_projected:,.0f}")
                with col4:
                    if st.session_state.target_sales:
                        st.metric("Target", f"AED {st.session_state.target_sales:,.0f}")
                    else:
                        st.metric("Target", "Not Set")
                with col5:
                    if st.session_state.target_sales:
                        color = "🟢" if gap >= 0 else "🔴"
                        st.metric("Gap", f"{color} {gap:,.0f}")
                    else:
                        st.metric("Gap", "-")
                
                st.divider()
                
                # Charts
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("### Historical Sales Trend")
                    try:
                        chart1 = viz.create_historical_sales_chart(st.session_state.historical_data)
                        st.plotly_chart(chart1, use_container_width=True)
                    except Exception as e:
                        st.warning(f"Could not display chart: {str(e)}")
                
                with col2:
                    st.markdown("### Weekday Performance")
                    try:
                        chart2 = viz.create_weekday_chart(weekday_averages)
                        st.plotly_chart(chart2, use_container_width=True)
                    except Exception as e:
                        st.warning(f"Could not display chart: {str(e)}")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("### Monthly Forecast")
                    try:
                        chart3 = viz.create_forecast_chart(forecast_data)
                        st.plotly_chart(chart3, use_container_width=True)
                    except Exception as e:
                        st.warning(f"Could not display chart: {str(e)}")
                
                with col2:
                    if st.session_state.target_sales:
                        st.markdown("### Target vs Projection")
                        try:
                            chart4 = viz.create_target_chart(forecast_data)
                            st.plotly_chart(chart4, use_container_width=True)
                        except Exception as e:
                            st.warning(f"Could not display chart: {str(e)}")
                    else:
                        st.info("ℹ️ Set a target to see comparison")
                
                if st.session_state.current_month_data and len(st.session_state.current_month_data) > 0:
                    st.markdown("### Actual vs Projected Sales")
                    try:
                        # Extract the first data dict from the list
                        current_month = st.session_state.current_month_data[0]
                        chart5 = viz.create_actual_vs_projected_chart(
                            forecast_data,
                            current_month
                        )
                        st.plotly_chart(chart5, use_container_width=True)
                    except Exception as e:
                        st.warning(f"Could not display chart: {str(e)}")
            
            except Exception as e:
                st.error(f"Dashboard Error: {str(e)}")
                st.info("Make sure your Excel files have 'Date' and 'Sales' columns")
    
    # TAB 3: Settings
    with tab3:
        st.markdown("## Administration Settings")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### Data Status")
            if st.session_state.historical_data:
                st.success(f"✓ Historical data loaded ({len(st.session_state.historical_data)} records)")
            else:
                st.warning("⚠ No historical data")
            
            if st.session_state.current_month_data:
                st.success(f"✓ Current month loaded ({len(st.session_state.current_month_data)} records)")
            else:
                st.info("ℹ Current month not loaded")
            
            if st.session_state.target_sales:
                st.success(f"✓ Target: AED {st.session_state.target_sales:,.0f}")
            else:
                st.info("ℹ Target not set")
        
        with col2:
            st.markdown("### Actions")
            if st.button("🔄 Clear All Data", use_container_width=True):
                st.session_state.historical_data = None
                st.session_state.current_month_data = None
                st.session_state.target_sales = None
                st.success("✓ All data cleared")
                st.rerun()
    
    # TAB 4: About
    with tab4:
        st.markdown("""
        ## 🏢 Champion Cleaners Sales Dashboard
        
        **Version**: 1.0.0  
        **Last Updated**: January 2026
        
        ### Features
        - ✓ Multi-format Excel support
        - ✓ Weekday-based forecasting
        - ✓ Real-time KPI tracking
        - ✓ Professional interactive charts
        - ✓ Secure admin panel
        - ✓ 24-hour session timeout
        
        ### Algorithm
        The system calculates average sales for each day of the week from historical data,
        then projects these patterns forward to forecast future sales.
        
        **Formula**: `Forecast for Day = Average of all historical instances of that day`
        
        ### Support
        📧 **Email**: adeelciit786@gmail.com  
        🔗 **GitHub**: [adeelciit786-hue/champion](https://github.com/adeelciit786-hue/champion)
        
        ---
        *Built with ❤️ for Champion Cleaners*
        """)

# Main app logic
check_session_timeout()

if not st.session_state.authenticated:
    login_page()
else:
    admin_panel()

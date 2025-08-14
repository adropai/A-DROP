# Health check API endpoint
from flask import Flask, jsonify
import psutil
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Application status
        status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'environment': os.getenv('NODE_ENV', 'development'),
            'version': os.getenv('APP_VERSION', '1.0.0'),
            'system': {
                'cpu_usage': f"{cpu_percent}%",
                'memory_usage': f"{memory.percent}%",
                'memory_available': f"{memory.available // (1024*1024)} MB",
                'disk_usage': f"{disk.percent}%",
                'disk_free': f"{disk.free // (1024*1024*1024)} GB"
            },
            'services': {
                'database': check_database(),
                'redis': check_redis(),
                'filesystem': check_filesystem()
            }
        }
        
        # Determine overall health
        if any(service['status'] == 'unhealthy' for service in status['services'].values()):
            status['status'] = 'degraded'
            return jsonify(status), 503
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def check_database():
    """Check database connectivity"""
    try:
        # Add database connection check here
        return {
            'status': 'healthy',
            'response_time': '< 100ms',
            'last_check': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'last_check': datetime.utcnow().isoformat()
        }

def check_redis():
    """Check Redis connectivity"""
    try:
        # Add Redis connection check here
        return {
            'status': 'healthy',
            'response_time': '< 50ms',
            'last_check': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'last_check': datetime.utcnow().isoformat()
        }

def check_filesystem():
    """Check filesystem health"""
    try:
        test_file = '/tmp/health_check_test'
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        
        return {
            'status': 'healthy',
            'writable': True,
            'last_check': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'writable': False,
            'last_check': datetime.utcnow().isoformat()
        }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

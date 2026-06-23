# ============================================================
# 프로젝트 공통 Dockerfile
# 대상 환경: x86_64 Ubuntu 호스트 + Docker + ROS2 Humble 개발환경
#
# 일반 팀원은 이 Dockerfile을 수정 없이 사용하시면 됩니다.
# GPU, DISPLAY, 카메라 장치, 시리얼 장치, 프로젝트 경로처럼
# 호스트마다 달라지는 값은 아래 파일에서 수정합니다.
#   - .env
#   - docker-compose.yaml
#   - docker-compose.gpu.yaml
#   - run.sh
#
# 관리자만 수정할 항목:
#   - ROS2 버전
#   - Gazebo 버전
#   - ESP-IDF 버전
#   - Micro-ROS 브랜치
#   - Python 패키지 버전
#   - 추가 apt 패키지
#
# 주의:
#   Jetson/aarch64 환경에서는 이 Dockerfile을 그대로 사용할 수
#   없을 수 있습니다.
# ============================================================

# ============================================================
# Project Dockerfile
# Target: x86_64 Ubuntu host + Docker + ROS2 Humble development
#
# Team members should NOT edit this Dockerfile for normal setup.
# Host-specific settings such as GPU, DISPLAY, camera device,
# serial device, and project path must be configured in:
#   - .env
#   - docker-compose.yaml
#   - docker-compose.gpu.yaml
#   - run.sh
#
# Maintainer-only changes:
#   - ROS2 version
#   - Gazebo version
#   - ESP-IDF version
#   - Micro-ROS branch
#   - Python package versions
#   - additional apt packages
#
# Note:
#   This Dockerfile is not guaranteed to work on Jetson/aarch64
#   without modification.
# ============================================================


# ============================================================
# 1. Base image
# ============================================================
# [TEAM DO NOT EDIT]
# ROS2 Humble Desktop 이미지를 기본 베이스로 사용합니다.
FROM osrf/ros:humble-desktop


# ============================================================
# 2. System packages + Gazebo Harmonic
# ============================================================
# [MAINTAINER ONLY]
# 시스템 패키지를 최신화하고, Gazebo Harmonic 저장소를 등록한 뒤,
# ROS2 / Gazebo / ESP-IDF / 시뮬레이션 / 디버깅에 필요한 패키지를 설치합니다.
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release && \
    curl https://packages.osrfoundation.org/gazebo.key | apt-key add - && \
    echo "deb http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -sc) main" > /etc/apt/sources.list.d/gazebo-stable.list && \
    apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    python3-pip \
    python3-venv \
    libusb-1.0-0-dev \
    git \
    wget \
    flex \
    bison \
    gperf \
    python3-setuptools \
    python3-serial \
    python3-click \
    libffi-dev \
    libssl-dev \
    dfu-util \
    libusb-1.0-0 \
    mesa-utils \
    libgl1-mesa-glx \
    libgl1-mesa-dri \
    ros-humble-ros-gzharmonic \
    gz-harmonic \
    libgz-sim8-dev \
    libgz-transport13-dev \
    libgz-msgs10-dev \
    libgz-common5-dev \
    libgz-math7-dev \
    ros-humble-urdf-tutorial \
    xterm && \
    rm -rf /var/lib/apt/lists/*


# ============================================================
# 3. Gazebo version
# ============================================================
# [TEAM DO NOT EDIT]
# Gazebo Harmonic을 사용한다는 것을 명시합니다.
# ROS-Gazebo bridge와 Gazebo 실행 시 버전 혼선을 줄이기 위한 설정입니다.
ENV GZ_VERSION=harmonic


# ============================================================
# 4. Pixi
# ============================================================
# [MAINTAINER ONLY]
# Pixi를 설치하고 PATH에 등록합니다.
# 팀원별 수정 항목이 아닙니다.
RUN curl -fsSL https://pixi.sh/install.sh | bash
ENV PATH="/root/.pixi/bin:$PATH"


# ============================================================
# 5. Git safe directory
# ============================================================
# [TEAM DO NOT EDIT]
# 호스트와 컨테이너 사용자 ID가 달라서 발생하는 Git ownership 에러를 방지합니다.
RUN git config --global --add safe.directory '*'


# ============================================================
# 6. Shell
# ============================================================
# [TEAM DO NOT EDIT]
# Dockerfile 내부 RUN 명령에서 source 명령어를 사용하기 위해 기본 셸을 bash로 변경합니다.
SHELL ["/bin/bash", "-c"]


# ============================================================
# 7. ESP-IDF
# ============================================================
# [MAINTAINER ONLY]
# ESP32 펌웨어 빌드를 위해 ESP-IDF v5.1을 설치합니다.
# ESP-IDF 버전이나 타겟 칩이 바뀌는 경우에만 수정합니다.
WORKDIR /opt/esp

RUN git clone --recursive -b v5.1 https://github.com/espressif/esp-idf.git . && \
    ./install.sh esp32


# ============================================================
# 8. Micro-ROS Agent
# ============================================================
# [MAINTAINER ONLY]
# ROS2 Humble용 micro-ROS Agent를 빌드합니다.
# ESP32와 ROS2 시스템 사이의 통신을 위해 필요합니다.
WORKDIR /micro_ros_ws

RUN git clone -b humble https://github.com/micro-ROS/micro_ros_setup.git src/micro_ros_setup && \
    apt-get update && \
    rosdep update && \
    rosdep install --from-paths src --ignore-src -y && \
    source /opt/ros/humble/setup.bash && \
    colcon build && \
    source install/setup.bash && \
    ros2 run micro_ros_setup create_agent_ws.sh && \
    ros2 run micro_ros_setup build_agent.sh && \
    rm -rf log/ build/ src/ && \
    rm -rf /var/lib/apt/lists/*


# ============================================================
# 9. Project workspace
# ============================================================
# [TEAM DO NOT EDIT]
# 프로젝트 코드를 컨테이너 내부 /app 경로에 복사합니다.
#
# 주의:
#   이 COPY는 이미지 빌드 시점의 프로젝트 파일을 이미지 안에 넣습니다.
#   개발 중 실시간 코드 반영은 docker-compose.yaml의 volume mount로 처리하는 것이 좋습니다.
WORKDIR /app

COPY . .


# ============================================================
# 10. Bash environment
# ============================================================
# [TEAM DO NOT EDIT]
# 컨테이너 터미널이 열릴 때 ROS2와 micro-ROS 환경을 자동으로 불러옵니다.
# ESP-IDF는 무겁기 때문에 항상 자동 로드하지 않고, get_esp 명령으로 필요할 때만 로드합니다.
RUN echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc && \
    echo "source /micro_ros_ws/install/setup.bash" >> ~/.bashrc && \
    echo "export GZ_VERSION=harmonic" >> ~/.bashrc && \
    echo "alias get_esp='. /opt/esp/export.sh'" >> ~/.bashrc


# ============================================================
# 11. ESP-IDF Python environment fix
# ============================================================
# [MAINTAINER ONLY]
# ESP-IDF 가상환경 내부에 PX4 / ESP32 빌드에 필요한 Python 패키지를 미리 설치합니다.
# 패키지 버전 충돌을 줄이기 위해 일부 패키지는 버전을 고정합니다.
RUN /root/.espressif/python_env/idf5.1_py3.10_env/bin/python -m pip install --force-reinstall \
        pip==23.3.1 \
        setuptools==65.5.1 \
        wheel==0.41.2 \
        ruamel.yaml==0.17.40 \
        ruamel.yaml.clib==0.2.8 && \
    /root/.espressif/python_env/idf5.1_py3.10_env/bin/python -m pip install \
        empy==3.3.4 \
        jsonschema==4.17.3 \
        jinja2 \
        pyros-genmsg \
        packaging && \
    /root/.espressif/python_env/idf5.1_py3.10_env/bin/python -c "import pkg_resources; import ruamel.yaml; print('ESP-IDF python env OK')"

# [TEAM DO NOT EDIT]
# ESP-IDF Python 패키지 constraint 체크로 인한 빌드 중단을 방지합니다.
ENV IDF_PYTHON_CHECK_CONSTRAINTS=no


# ============================================================
# 12. Foxglove bridge
# ============================================================
# [MAINTAINER ONLY]
# Foxglove를 이용한 ROS2 토픽 모니터링을 위해 bridge 패키지를 설치합니다.
RUN apt-get update && apt-get install -y \
    ros-humble-foxglove-bridge && \
    rm -rf /var/lib/apt/lists/*


# ============================================================
# 13. Python packages
# ============================================================
# [MAINTAINER ONLY]
# 키보드 입력, 간단한 시뮬레이션 입력 처리 등에 사용할 pygame을 설치합니다.
RUN pip3 install --no-cache-dir pygame


# ============================================================
# 14. PlotJuggler + MCAP ROS2 support
# ============================================================
# [MAINTAINER ONLY]
# ROS2 데이터 로깅, 시각화, MCAP 저장소 사용을 위한 패키지를 설치합니다.
RUN apt-get update && apt-get install -y \
    ros-humble-plotjuggler-ros \
    ros-humble-rosbag2-storage-mcap && \
    rm -rf /var/lib/apt/lists/*


# ============================================================
# 15. MCAP CLI
# ============================================================
# [MAINTAINER ONLY]
# MCAP 파일 변환 및 확인용 CLI 도구를 설치합니다.
#
# 주의:
#   아래 바이너리는 linux-amd64용입니다.
#   Jetson / ARM / aarch64 환경에서는 별도 바이너리 또는 별도 Dockerfile이 필요합니다.
RUN curl -fL -o /usr/bin/mcap https://github.com/foxglove/mcap/releases/download/releases%2Fmcap-cli%2Fv0.0.45/mcap-linux-amd64 && \
    chmod +x /usr/bin/mcap


# ============================================================
# 16. Default command
# ============================================================
# [TEAM DO NOT EDIT]
# 컨테이너 시작 시 기본적으로 bash 터미널을 실행합니다.
CMD ["bash"]
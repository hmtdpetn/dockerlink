#!/bin/bash
source /pkgscripts-ng/include/pkg_util.sh

package="dockerlink"
version="1.0-0001"
os_min_ver="7.0-40000"
displayname="Docker Link"
description="A custom package for docker linking."
arch="$(pkg_get_unified_platform)"
maintainer="xray"
install_dep_packages="Python3.9"

# 桌面应用配置（不要adminport/adminurl）
dsmuidir="ui"
dsmappname="xray.DockerLink"

[ "$(caller)" != "0 NULL" ] && return 0
pkg_dump_info

packageversion=`grep version package.json | sed -e s/^.*:// -e s/,$// -e s/\"//g -e s/[.]/-/g`
packagefilename=echarts-meta-model-${packageversion}
zip -r ${packagefilename} package.json ECharts Meta\ Model
